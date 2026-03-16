package com.example.playground;

public class App {
    public static void main(String[] args) {
        GreetingService greetingService = new GreetingService("Hello");
        System.out.println(greetingService.greet("World"));
    }
}
