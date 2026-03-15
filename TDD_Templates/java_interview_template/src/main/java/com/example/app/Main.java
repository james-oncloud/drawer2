package com.example.app;

public class Main {

    public static void main(String[] args) {
        GreetingService greetingService = new GreetingService();
        String name = args.length > 0 ? args[0] : "";

        System.out.println(greetingService.greet(name));
    }
}
