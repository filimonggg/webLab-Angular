package ru.itmo.lab.util;

import jakarta.servlet.http.HttpSession;

public final class Auth {
    private Auth() {}

    public static Long getUserId(HttpSession session) {
        Object v = session.getAttribute("userId");
        return (v instanceof Long) ? (Long) v : null;
    }

    public static void setUserId(HttpSession session, Long id) {
        session.setAttribute("userId", id);
    }
}