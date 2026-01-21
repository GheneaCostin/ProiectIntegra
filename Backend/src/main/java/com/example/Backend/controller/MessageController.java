package com.example.Backend.controller;

import com.example.Backend.model.Message;
import com.example.Backend.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/messages")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class MessageController {

    @Autowired
    private MessageService messageService;
    @PostMapping("/send")
    public ResponseEntity<Message> sendMessage(@RequestBody Message message) {
        Message savedMessage = messageService.saveMessage(message);
        return ResponseEntity.ok(savedMessage);
    }

    @GetMapping("/{senderId}/{receiverId}")
    public ResponseEntity<List<Message>> getConversation(
            @PathVariable String senderId,
            @PathVariable String receiverId) {
        List<Message> messages = messageService.getChatMessages(senderId, receiverId);
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/history")
    public ResponseEntity<?> getHistory(
            @RequestParam String userId1,
            @RequestParam String userId2) {
        try {
            List<Message> history = messageService.getConversationHistory(userId1, userId2);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Eroare la preluarea istoricului: " + e.getMessage());
        }
    }

}