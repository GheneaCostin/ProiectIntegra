package com.example.Backend.model;

import java.util.Date;

public class TreatmentIntake {
    private Date date;
    private Integer doseIndex;

    public TreatmentIntake() {
    }

    public TreatmentIntake(Date date, Integer doseIndex) {
        this.date = date;
        this.doseIndex = doseIndex;
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }

    public Integer getDoseIndex() {
        return doseIndex;
    }

    public void setDoseIndex(Integer doseIndex) {
        this.doseIndex = doseIndex;
    }

}