package com.example.Backend.controller;

import com.example.Backend.model.Message;
import com.example.Backend.dto.ReadReceiptDTO;
import com.example.Backend.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    @Autowired
    private MessageService messageService;


    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/send")
    @SendTo("/topic/messages")
    public Message sendMessage(Message message) {
        return messageService.saveMessage(message);
    }


    @MessageMapping("/read")
    public void sendReadReceipt(ReadReceiptDTO dto) {
        messagingTemplate.convertAndSend("/topic/read", dto);
    }
}