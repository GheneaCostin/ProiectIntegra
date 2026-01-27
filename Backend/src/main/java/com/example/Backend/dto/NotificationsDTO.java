package com.example.Backend.dto;

public class NotificationsDTO {
    private String senderId;
    private String fullName;
    private String message;
    private int count;

    public NotificationsDTO(String senderId, String fullName, String message, int count) {
        this.senderId = senderId;
        this.fullName = fullName;
        this.message = message;
        this.count = count;
    }

    // Getters & Setters
    public String getSenderId() { return senderId; }
    public void setSenderId(String senderId) { this.senderId = senderId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public int getCount() { return count; }
    public void setCount(int count) { this.count = count; }
}