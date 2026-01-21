package com.example.Backend.service;

import com.example.Backend.model.Message;
import com.example.Backend.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

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
}