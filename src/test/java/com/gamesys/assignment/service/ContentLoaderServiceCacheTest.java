package com.gamesys.assignment.service;

import com.gamesys.assignment.exception.ExtendedException;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class ContentLoaderServiceCacheTest {

    @Test
    public void fetchContentTest() {
        Assertions.assertThrows(ExtendedException.class, () -> {
            ContentLoaderServiceCache.fetchContent("blahblah");
        }, "Exception should be thrown if a partial doesn't exist");

        Assertions.assertThrows(ExtendedException.class, () -> {
            ContentLoaderServiceCache.fetchContent("empty");
        }, "Exception should be thrown if the partial content is empty");

        Assertions.assertDoesNotThrow(() -> {
            ContentLoaderServiceCache.fetchContent("home");
        }, "Should fetch the content of a valid partial without error");

        String testContent = "";
        try {
            testContent = ContentLoaderServiceCache.fetchContent("test");
        } catch( ExtendedException e ){}
        Assertions.assertEquals("TEST", testContent,"Should fetch the partial content correctly");
    }

}
