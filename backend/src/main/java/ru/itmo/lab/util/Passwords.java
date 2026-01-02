package ru.itmo.lab.util;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Base64;

public class Passwords {
    private static final SecureRandom RNG = new SecureRandom();
    private static final int ITER = 120_000;
    private static final int KEY_LEN = 256;

    private Passwords() {}

    public static String hash(String password) {
        byte[] salt = new byte[16];
        RNG.nextBytes(salt);
        byte[] dk = pbkdf2(password.toCharArray(), salt, ITER, KEY_LEN);
        return "pbkdf2$" + ITER + "$" +
                Base64.getEncoder().encodeToString(salt) + "$" +
                Base64.getEncoder().encodeToString(dk);
    }

    public static boolean verify(String password, String stored) {
        try {
            String[] parts = stored.split("\\$");
            int iter = Integer.parseInt(parts[1]);
            byte[] salt = Base64.getDecoder().decode(parts[2]);
            byte[] dkStored = Base64.getDecoder().decode(parts[3]);
            byte[] dk = pbkdf2(password.toCharArray(), salt, iter, dkStored.length * 8);
            if (dk.length != dkStored.length) return false;
            return Arrays.equals(dk, dkStored);
        } catch (Exception e) {
            return false;
        }
    }

    private static byte[] pbkdf2(char[] pass, byte[] salt, int iter, int keyLenBits) {
        try {
            PBEKeySpec spec = new PBEKeySpec(pass, salt, iter, keyLenBits);
            SecretKeyFactory skf = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
            return skf.generateSecret(spec).getEncoded();
        } catch (Exception e) {
            throw new IllegalStateException("Password hashing failed", e);
        }
    }
}
