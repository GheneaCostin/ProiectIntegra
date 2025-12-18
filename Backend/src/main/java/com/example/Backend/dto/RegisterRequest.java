package com.example.Backend.dto;

import java.util.Date;

public class RegisterRequest {
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private String sex;
    private int height;
    private int weight;
    private Date birthDate;


    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getSex() { return sex; }
    public void setSex(String sex) { this.sex = sex; }

    public int getHeight() { return height; }
    public void setHeight(int height) { this.height = height; }

    public int getWeight() { return weight; }
    public void setWeight(int weight) { this.weight = weight; }

    public Date getBirthDate() { return birthDate; }
    public void setBirthDate(Date birthDate) { this.birthDate = birthDate; }
}