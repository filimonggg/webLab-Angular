package ru.itmo.lab.rest.dto;

public class UserResponse {
    public long id;
    public String login;
    public UserResponse(long id, String login) { this.id = id; this.login = login; }
}