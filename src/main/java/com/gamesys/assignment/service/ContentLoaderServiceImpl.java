package com.gamesys.assignment.service;

import com.gamesys.assignment.bean.LoadedContent;
import com.gamesys.assignment.exception.ErrorCode;
import com.gamesys.assignment.exception.ExtendedException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;

@Service("contentLoaderService")
public class ContentLoaderServiceImpl implements ContentLoaderService {

    @Autowired
    private ContentLoaderServiceCache contentLoaderServiceCache;

    public LoadedContent fetchPartialContent(String partial) {

        String content = null;
        ErrorCode error = null;

        try {
            content = contentLoaderServiceCache.fetchContent(partial);
        } catch(ExtendedException e) {
            e.printStackTrace();
            error = e.getError();
        }

        if(error != null) {
            ErrorCode[] notLoadedErrors = {ErrorCode.FILE_NOT_FOUND, ErrorCode.FILE_READ_ISSUE};
            if(Arrays.asList(notLoadedErrors).contains(error)) {
                try {
                    content = contentLoaderServiceCache.fetchContent(NOT_FOUND_PARTIAL);
                } catch(ExtendedException e) {
                    e.printStackTrace();
                }
            }
        }

        return new LoadedContent(error, content);

    }

}
