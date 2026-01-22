package com.example.Backend.dto;

import java.time.LocalDateTime;

public class ConversationDTO {
    private String conversationUserId;
    private String fullName;
    private String lastMessage;
    private LocalDateTime timestamp;
    private boolean read;


    public ConversationDTO(String conversationUserId, String fullName, String lastMessage, LocalDateTime timestamp, boolean read) {
        this.conversationUserId = conversationUserId;
        this.fullName = fullName;
        this.lastMessage = lastMessage;
        this.timestamp = timestamp;
        this.read = read;
    }


    public String getConversationUserId() { return conversationUserId; }
    public void setConversationUserId(String conversationUserId) { this.conversationUserId = conversationUserId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getLastMessage() { return lastMessage; }
    public void setLastMessage(String lastMessage) { this.lastMessage = lastMessage; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }
}