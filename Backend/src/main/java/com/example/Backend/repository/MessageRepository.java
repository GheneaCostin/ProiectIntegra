package com.example.Backend.repository;

import com.example.Backend.model.Message;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface MessageRepository extends MongoRepository<Message, String> {

    List<Message> findBySenderIdAndReceiverIdOrderByTimestampAsc(String senderId, String receiverId);

}