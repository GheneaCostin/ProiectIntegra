package com.example.Backend.service;

import com.example.Backend.dto.ConversationDTO;
import com.example.Backend.model.Message;
import com.example.Backend.model.User;
import com.example.Backend.model.UserDetails;
import com.example.Backend.repository.MessageRepository;
import com.example.Backend.repository.UserDetailsRepository;
import com.example.Backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserDetailsRepository userDetailsRepository;

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

        if (allMessages == null) {
            return new ArrayList<>();
        }

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

            String fullName = "Utilizator Necunoscut";

            try {

                Optional<UserDetails> detailsOpt = userDetailsRepository.findByUserId(partnerId);
                if (detailsOpt.isPresent()) {
                    UserDetails details = detailsOpt.get();
                    if (details.getFirstName() != null && details.getLastName() != null) {
                        fullName = details.getFirstName() + " " + details.getLastName();
                    }
                }


                if (fullName.equals("Utilizator Necunoscut")) {
                    Optional<User> userOpt = userRepository.findById(partnerId);
                    if (userOpt.isPresent()) {
                        fullName = userOpt.get().getEmail();
                    }
                }
            } catch (Exception e) {
                System.err.println("Eroare la căutarea numelui pentru " + partnerId + ": " + e.getMessage());
            }

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
}