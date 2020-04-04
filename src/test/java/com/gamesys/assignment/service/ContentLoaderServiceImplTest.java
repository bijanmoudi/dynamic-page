package com.gamesys.assignment.service;

import com.gamesys.assignment.bean.LoadedContent;
import com.gamesys.assignment.exception.ErrorCode;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class ContentLoaderServiceImplTest {

    @Autowired
    private ContentLoaderService contentLoaderService;

    @Test
    public void fetchPartialContentTest() {

        LoadedContent notFoundContent = contentLoaderService.fetchPartialContent("blahblah");
        Assertions.assertEquals(ErrorCode.FILE_NOT_FOUND, notFoundContent.getError(),"Should return \"Not found\" error if a partial doesn't exist");

        LoadedContent emptyContent = contentLoaderService.fetchPartialContent("empty");
        Assertions.assertEquals(ErrorCode.FILE_IS_EMPTY, emptyContent.getError(),"Should return \"Is empty\" error if the partial content is empty");

        LoadedContent homeContent = contentLoaderService.fetchPartialContent("home");
        Assertions.assertEquals(null, homeContent.getError(),"Should fetch the content of a valid partial without error");

        LoadedContent testContent = contentLoaderService.fetchPartialContent("test");
        Assertions.assertEquals("TEST", testContent.getContent(),"Should fetch the partial content correctly");

    }

}
