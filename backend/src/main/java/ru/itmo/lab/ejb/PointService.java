package ru.itmo.lab.ejb;

import ru.itmo.lab.model.PointEntity;
import ru.itmo.lab.model.UserEntity;
import ru.itmo.lab.util.AreaChecker;
import jakarta.ejb.Stateless;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.List;

@Stateless
public class PointService {
    @PersistenceContext(unitName = "PointsPU")
    private EntityManager em;

    public PointEntity checkAndSave(double x, double y, double r, UserEntity user) {
        long start = System.nanoTime();
        boolean inside = AreaChecker.isHit(x, y, r);
        long executionTime = System.nanoTime() - start;
        String serverTime = LocalDateTime.now().toString();
        PointEntity p = new PointEntity(x, y, r, inside, executionTime, serverTime, user);
        em.persist(p);
        return p;
    }

    public List<PointEntity> listForUser(UserEntity user) {
        return em.createQuery("select p from PointEntity p where p.user = :u order by p.id desc", PointEntity.class)
                .setParameter("u", user).getResultList();
    }

    public void clearForUser(UserEntity user) {
        em.createQuery("delete from PointEntity p where p.user = :u")
                .setParameter("u", user).executeUpdate();
    }
}

