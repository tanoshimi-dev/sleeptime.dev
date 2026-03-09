package dev.sleeptime.portal.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_subsystems", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "subsystem_id"})
})
public class UserSubsystem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subsystem_id", nullable = false)
    private Subsystem subsystem;

    @Column(nullable = false)
    private String role = "USER";

    @Column(nullable = false)
    private boolean enabled = true;

    @Column(name = "granted_at", nullable = false, updatable = false)
    private OffsetDateTime grantedAt;

    @PrePersist
    protected void onCreate() {
        grantedAt = OffsetDateTime.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Subsystem getSubsystem() { return subsystem; }
    public void setSubsystem(Subsystem subsystem) { this.subsystem = subsystem; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }

    public OffsetDateTime getGrantedAt() { return grantedAt; }
}
