// src/main/java/com/example/lab/rest/PointsResource.java
package ru.itmo.lab.rest;

import ru.itmo.lab.ejb.PointService;
import ru.itmo.lab.ejb.UserService;
import ru.itmo.lab.model.PointEntity;
import ru.itmo.lab.model.UserEntity;
import ru.itmo.lab.rest.dto.PointRequest;
import ru.itmo.lab.rest.dto.PointResponse;
import ru.itmo.lab.util.Auth;
import jakarta.ejb.EJB;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

@Path("/points")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class PointsResource {

    @EJB private PointService points;
    @EJB private UserService users;

    @Context private HttpServletRequest req;

    private UserEntity requireUser() {
        HttpSession session = req.getSession(false);
        if (session == null) throw new WebApplicationException(Response.Status.UNAUTHORIZED);
        Long id = Auth.getUserId(session);
        if (id == null) throw new WebApplicationException(Response.Status.UNAUTHORIZED);
        UserEntity u = users.findById(id);
        if (u == null) throw new WebApplicationException(Response.Status.UNAUTHORIZED);
        return u;
    }

    @GET
    public List<PointResponse> list() {
        UserEntity u = requireUser();
        return points.listForUser(u).stream().map(this::map).toList();
    }

    @POST
    public PointResponse add(PointRequest body) {
        UserEntity u = requireUser();
        if (body == null) throw new WebApplicationException(Response.Status.BAD_REQUEST);
        if (body.y < -3 || body.y > 5) throw new WebApplicationException("Y out of range", 400);
        if (body.r <= 0) throw new WebApplicationException("R must be > 0", 400);

        PointEntity p = points.checkAndSave(body.x, body.y, body.r, u);
        return map(p);
    }

    @DELETE
    public Response clear() {
        UserEntity u = requireUser();
        points.clearForUser(u);
        return Response.ok().build();
    }

    private PointResponse map(PointEntity p) {
        PointResponse r = new PointResponse();
        r.id = p.getId();
        r.x = p.getX();
        r.y = p.getY();
        r.r = p.getR();
        r.inside = p.isInside();
        r.executionTime = p.getExecutionTime();
        r.serverTime = p.getServerTime();
        return r;
    }
}
