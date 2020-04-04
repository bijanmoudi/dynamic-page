package com.gamesys.assignment.bean;

import com.gamesys.assignment.exception.ErrorCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public final class LoadedContent {

    private ErrorCode error;
    private String content;

    public LoadedContent(ErrorCode error, String content) {
        this.error = error;
        this.content = content;
    }

}