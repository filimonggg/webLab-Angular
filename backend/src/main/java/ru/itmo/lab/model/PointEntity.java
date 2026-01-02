package ru.itmo.lab.model;

import jakarta.persistence.*;

@Entity
@Table(name = "points")
public class PointEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private double x;
    private double y;
    private double r;
    private boolean inside;

    @Column(name = "exec_time")
    private long executionTime;

    @Column(name = "server_time")
    private String serverTime;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private UserEntity user;

    public PointEntity() {}

    public PointEntity(double x, double y, double r, boolean inside, long executionTime, String serverTime, UserEntity user) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.inside = inside;
        this.executionTime = executionTime;
        this.serverTime = serverTime;
        this.user = user;
    }

    public Long getId() { return id; }
    public double getX() { return x; }
    public double getY() { return y; }
    public double getR() { return r; }
    public boolean isInside() { return inside; }
    public long getExecutionTime() { return executionTime; }
    public String getServerTime() { return serverTime; }
}
