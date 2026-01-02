// src/main/java/com/example/lab/rest/AuthResource.java
package ru.itmo.lab.rest;

import ru.itmo.lab.ejb.UserService;
import ru.itmo.lab.model.UserEntity;
import ru.itmo.lab.rest.dto.LoginRequest;
import ru.itmo.lab.rest.dto.UserResponse;
import ru.itmo.lab.util.Auth;
import jakarta.ejb.EJB;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

@Path("/auth")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class AuthResource {

    @EJB
    private UserService users;

    @Context
    private HttpServletRequest req;

    @POST
    @Path("/login")
    public Response login(LoginRequest body) {
        if (body == null || body.login == null || body.password == null) {
            return Response.status(Response.Status.BAD_REQUEST).entity("Missing login/password").build();
        }

        UserEntity u = users.registerOrLogin(body.login.trim(), body.password);

        if (u == null) return Response.status(Response.Status.UNAUTHORIZED).build();

        HttpSession session = req.getSession(true);
        Auth.setUserId(session, u.getId());
        return Response.ok(new UserResponse(u.getId(), u.getLogin())).build();
    }

    @GET
    @Path("/me")
    public Response me() {
        HttpSession session = req.getSession(false);
        if (session == null) return Response.status(Response.Status.UNAUTHORIZED).build();
        Long id = Auth.getUserId(session);
        if (id == null) return Response.status(Response.Status.UNAUTHORIZED).build();

        return Response.ok(new UserResponse(id, "ok")).build();
    }

    @POST
    @Path("/logout")
    public Response logout() {
        HttpSession session = req.getSession(false);
        if (session != null) session.invalidate();
        return Response.ok().build();
    }
}
