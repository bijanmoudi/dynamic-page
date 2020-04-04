package com.gamesys.assignment.bean;

import com.gamesys.assignment.exception.ErrorCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashMap;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
public final class ApiResponse {

    private ApiError error;
    private Map<String, Object> payload;
    private boolean success;

    public ApiResponse(String payload, ErrorCode error) {
        this.success = error == null;
        this.error = error != null ? new ApiError(error) : null;
        this.payload = new HashMap<>();
        this.payload.put("content", payload);
    }

    public ApiResponse(Map<String, Object> payload, ErrorCode error) {
        this.success = error == null;
        this.error = error != null ? new ApiError(error) : null;
        this.payload = payload;
    }

}