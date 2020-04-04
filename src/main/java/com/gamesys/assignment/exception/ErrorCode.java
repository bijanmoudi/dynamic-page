package com.gamesys.assignment.exception;

public enum ErrorCode {

    FILE_NOT_FOUND(1001, "Not found! :("),
    FILE_READ_ISSUE(1001, "Error occurred while trying to load the content! :("),
    FILE_IS_EMPTY(1003, "No content provided! :(");

    private final int code;
    private final String message;

    ErrorCode(int code, String message) {
        this.code = code;
        this.message = message;
    }

    public int getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }

}