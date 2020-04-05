package com.gamesys.assignment.service;

import com.gamesys.assignment.bean.LoadedContent;
import com.gamesys.assignment.exception.ErrorCode;
import com.gamesys.assignment.exception.ExtendedException;
import org.springframework.stereotype.Service;

import java.util.Arrays;

@Service("contentLoaderService")
public class ContentLoaderServiceImpl implements ContentLoaderService {

    public LoadedContent fetchPartialContent(String partial) {

        String content = null;
        ErrorCode error = null;

        try {
            content = ContentLoaderServiceCache.fetchContent(partial);
        } catch(ExtendedException e) {
            e.printStackTrace();
            error = e.getError();
        }

        if(error != null) {
            ErrorCode[] notLoadedErrors = {ErrorCode.FILE_NOT_FOUND, ErrorCode.FILE_READ_ISSUE};
            if(Arrays.asList(notLoadedErrors).contains(error)) {
                try {
                    content = ContentLoaderServiceCache.fetchContent(NOT_FOUND_PARTIAL);
                } catch(ExtendedException e) {
                    e.printStackTrace();
                }
            }
        }

        return new LoadedContent(error, content);

    }

}
