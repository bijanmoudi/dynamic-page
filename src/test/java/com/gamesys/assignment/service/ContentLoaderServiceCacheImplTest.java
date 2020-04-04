package com.gamesys.assignment.service;

import com.gamesys.assignment.exception.ExtendedException;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class ContentLoaderServiceCacheImplTest {

    @Autowired
    private ContentLoaderServiceCache contentLoaderServiceCache;

    @Test
    public void fetchContentTest() {
        Assertions.assertThrows(ExtendedException.class, () -> {
            contentLoaderServiceCache.fetchContent("blahblah");
        }, "Exception should be thrown if a partial doesn't exist");

        Assertions.assertThrows(ExtendedException.class, () -> {
            contentLoaderServiceCache.fetchContent("empty");
        }, "Exception should be thrown if the partial content is empty");

        Assertions.assertDoesNotThrow(() -> {
            contentLoaderServiceCache.fetchContent("home");
        }, "Should fetch the content of a valid partial without error");

        String testContent = "";
        try {
            testContent = contentLoaderServiceCache.fetchContent("test");
        } catch( ExtendedException e ){}
        Assertions.assertEquals("TEST", testContent,"Should fetch the partial content correctly");
    }

}
