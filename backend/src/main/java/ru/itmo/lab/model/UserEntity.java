package ru.itmo.lab.model;

import jakarta.persistence.*;

@Entity
@Table(name = "app_users", uniqueConstraints = @UniqueConstraint(columnNames = "login"))
public class UserEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String login;

    @Column(name = "password_hash", nullable = false, length = 200)
    private String passwordHash;

    public UserEntity() {}

    public UserEntity(String login, String passwordHash) {
        this.login = login;
        this.passwordHash = passwordHash;
    }

    public Long getId() { return id; }

    public String getLogin() { return login; }

    public String getPasswordHash() { return passwordHash; }

    public void setLogin(String login) { this.login = login; }

    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
}
