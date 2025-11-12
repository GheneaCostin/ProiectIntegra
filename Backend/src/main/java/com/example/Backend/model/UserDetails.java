package com.example.Backend.model;


import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "userDetails")
public class UserDetails {

    @Id
    private String id;
    private String userId;
    private int age;
    private int height;
    private int weight;
    private String sex;
    private String extrainfo;
    private String firstName;
    private String lastName;

    public UserDetails() {
    }

    public UserDetails(String userId, int age, int height, int weight, String sex, String extrainfo, String firstName, String lastName) {
        this.userId = userId;
        this.age = age;
        this.height = height;
        this.weight = weight;
        this.sex = sex;
        this.extrainfo = extrainfo;
        this.firstName = firstName;
        this.lastName = lastName;

    }

    //Getteri și setteri

    public String getId() {return id;}
    public String getUserId() {return userId;}

    public void setAge(int age) {this.age = age;}
    public int getAge() {return age;}

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
