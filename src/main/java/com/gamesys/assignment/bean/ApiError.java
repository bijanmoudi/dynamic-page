package com.gamesys.assignment.bean;

import com.gamesys.assignment.exception.ErrorCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public final class ApiError {

    private int code;
    private String message;

    public ApiError(ErrorCode error) {
        this.code = error.getCode();
        this.message = error.getMessage();
    }

}