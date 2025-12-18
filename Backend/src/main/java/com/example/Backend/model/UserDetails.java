package com.example.Backend.model;


import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "userDetails")
public class UserDetails {

    @Id
    private String id;
    private String userId;
    private Date birthDate;
    private int height;
    private int weight;
    private String sex;
    private String extrainfo;
    private String firstName;
    private String lastName;

    public UserDetails() {
    }

    public UserDetails(String userId, Date birthDate, int height, int weight, String sex, String extrainfo, String firstName, String lastName) {
        this.userId = userId;
        this.birthDate = birthDate;
        this.height = height;
        this.weight = weight;
        this.sex = sex;
        this.extrainfo = extrainfo;
        this.firstName = firstName;
        this.lastName = lastName;

    }


    public String getId() {return id;}
    public String getUserId() {return userId;}

    public void setUserId(String userId) {this.userId = userId;}

    public void setBirthDate(Date birthDate) {this.birthDate = birthDate;}
    public Date getBirthDate() {return birthDate;}

    public void setHeight(int height) {this.height = height;}
    public int getHeight() {return height;}

    public void setWeight(int weight) {this.weight = weight;}
    public int getWeight() {return weight;}

    public void setSex(String sex) {this.sex = sex;}
    public String getSex() {return sex;}

    public void setExtrainfo(String extrainfo) {this.extrainfo = extrainfo;}
    public String getExtrainfo() {return extrainfo;}

    public void setFirstName(String firstName) {this.firstName = firstName;}
    public String getFirstName() {return firstName;}

    public void setLastName(String lastName) {this.lastName = lastName;}
    public String getLastName() {return lastName;}


}
