package ru.itmo.lab.ejb;

import ru.itmo.lab.model.UserEntity;
import ru.itmo.lab.util.Passwords;
import jakarta.ejb.Stateless;
import jakarta.persistence.*;

@Stateless
public class UserService {
    @PersistenceContext(unitName = "PointsPU")
    private EntityManager em;

    public UserEntity findByLogin(String login) {
        try {
            return em.createQuery("select u from UserEntity u where u.login = :l", UserEntity.class)
                    .setParameter("l", login).getSingleResult();
        } catch (NoResultException e) {
            return null;
        }
    }

    public UserEntity findById(Long id) {
        if (id == null) return null;
        return em.find(UserEntity.class, id);
    }


    public UserEntity registerOrLogin(String login, String password) {
        UserEntity existing = findByLogin(login);
        if (existing == null) {
            UserEntity u = new UserEntity(login, Passwords.hash(password));
            em.persist(u);
            return u;
        }
        if (Passwords.verify(password, existing.getPasswordHash())) {
            return existing;
        }

        return null;
    }

    public UserEntity login(String login, String password) {
        UserEntity u = findByLogin(login);
        if (u == null) return null;
        return Passwords.verify(password, u.getPasswordHash()) ? u : null;
    }
}
