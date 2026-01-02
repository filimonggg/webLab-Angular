package ru.itmo.lab.util;

public final class AreaChecker {
    private AreaChecker() {}

    public static boolean isHit(double x, double y, double r) {
        if (x >= 0 && y >= 0) {
            return x <= r / 2.0 && y <= (-2.0 * x + r);
        }

        if (x <= 0 && y >= 0) {
            double rr = r / 2.0;
            return x * x + y * y <= rr * rr;
        }

        if (x >= 0 && y <= 0) {
            return x <= r && y >= -r / 2.0;
        }

        return false;
    }
}
