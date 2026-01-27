package com.example.Backend.service;

import com.example.Backend.dto.ConversationDTO;
import com.example.Backend.dto.ReadReceiptDTO;
import com.example.Backend.model.Message;
import com.example.Backend.dto.NotificationsDTO;
import com.example.Backend.model.User;
import com.example.Backend.model.UserDetails;
import com.example.Backend.repository.MessageRepository;
import com.example.Backend.repository.UserDetailsRepository;
import com.example.Backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private UserDetailsRepository userDetailsRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public Message saveMessage(Message message) {
        message.setTimestamp(LocalDateTime.now());
        message.setRead(false);
        return messageRepository.save(message);
    }

    public List<Message> getChatMessages(String senderId, String receiverId) {
        return messageRepository.findBySenderIdAndReceiverIdOrderByTimestampAsc(senderId, receiverId);
    }

    public List<Message> getConversationHistory(String userId1, String userId2) {
        return messageRepository.findBySenderIdAndReceiverIdOrSenderIdAndReceiverIdOrderByTimestampAsc(
                userId1, userId2,
                userId2, userId1
        );
    }


    public List<ConversationDTO> getUserConversations(String currentUserId) {
        List<Message> allMessages = messageRepository.findBySenderIdOrReceiverIdOrderByTimestampDesc(currentUserId, currentUserId);
        if (allMessages == null) return new ArrayList<>();

        Map<String, Message> latestMessagesMap = new LinkedHashMap<>();
        for (Message msg : allMessages) {
            if (msg.getSenderId() == null || msg.getReceiverId() == null) continue;
            String partnerId = msg.getSenderId().equals(currentUserId) ? msg.getReceiverId() : msg.getSenderId();
            latestMessagesMap.putIfAbsent(partnerId, msg);
        }

        List<ConversationDTO> conversations = new ArrayList<>();
        for (Map.Entry<String, Message> entry : latestMessagesMap.entrySet()) {
            String partnerId = entry.getKey();
            Message lastMsg = entry.getValue();


            String fullName = getFullNameForUser(partnerId);

            conversations.add(new ConversationDTO(
                    partnerId,
                    fullName,
                    lastMsg.getText(),
                    lastMsg.getTimestamp(),
                    lastMsg.isRead()
            ));
        }
        return conversations;
    }


    public void markMessagesAsRead(String senderId, String receiverId) {

        List<Message> unreadMessages = messageRepository.findBySenderIdAndReceiverIdAndReadFalse(senderId, receiverId);

        if (!unreadMessages.isEmpty()) {
            for (Message msg : unreadMessages) {
                msg.setRead(true);
            }
            messageRepository.saveAll(unreadMessages);


            ReadReceiptDTO dto = new ReadReceiptDTO(senderId, receiverId);
            messagingTemplate.convertAndSend("/topic/read", dto);
        }
    }


    public List<NotificationsDTO> getNotifications(String currentUserId) {
        List<Message> unreadMessages = messageRepository.findByReceiverIdAndReadFalse(currentUserId);

        Map<String, List<Message>> messagesBySender = unreadMessages.stream()
                .collect(Collectors.groupingBy(Message::getSenderId));

        List<NotificationsDTO> notifications = new ArrayList<>();

        for (Map.Entry<String, List<Message>> entry : messagesBySender.entrySet()) {
            String senderId = entry.getKey();
            List<Message> msgs = entry.getValue();


            msgs.sort(Comparator.comparing(Message::getTimestamp).reversed());
            String lastMessagePreview = msgs.get(0).getText();
            int count = msgs.size();


            String fullName = getFullNameForUser(senderId);

            notifications.add(new NotificationsDTO(senderId, fullName, lastMessagePreview, count));
        }

        return notifications;
    }


    private String getFullNameForUser(String userId) {
        String fullName = "Utilizator Necunoscut";
        try {
            Optional<UserDetails> detailsOpt = userDetailsRepository.findByUserId(userId);
            if (detailsOpt.isPresent()) {
                UserDetails details = detailsOpt.get();
                if (details.getFirstName() != null && details.getLastName() != null) {
                    fullName = details.getFirstName() + " " + details.getLastName();
                }
            }

            if (fullName.equals("Utilizator Necunoscut")) {
                Optional<User> userOpt = userRepository.findById(userId);
                if (userOpt.isPresent()) {
                    fullName = userOpt.get().getEmail();
                }
            }
        } catch (Exception e) {

        }
        return fullName;
    }
}