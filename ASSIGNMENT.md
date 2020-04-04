Test application consists of two parts - back-end (Java or Node.js) and front-end. It should be uploaded to Github and runnable from IDE or at least have a startup script that runs the application on http://localhost:8080

## Java back-end requirements

- Java 8 or higher
- Spring Boot 2
- Controller class with a single endpoint that returns different html content according to path
- Response content should be loaded from a file and cached in memory
- Serves static assets (frontend html)
- Unit tests (junit/testng)

### Java project structure

```
├── src
    ├── main
    │   └── java  <-- put controller/service/whatever classes here
    └── test
        └── java  <-- put test classes that invoke methods from the 'main' classes here
```

# Node.js back-end requirements

- Node.js 12 or higher
- Vanilla Node.js API only, no frameworks/additional packages/packers
- No non-standard feature flags, stick to what’s stable
- Arrow functions, template literals, async/awaits, destructuring assignments and other available features/syntactic sugar is most welcome
- Single handler that serves different html according to path is enough
- All necessary html shall be stored in separate files and cached in memory

# Front-end requirements

- Single HTML page with CSS and code in vanilla ES5, no external/additional libraries/frameworks/packers
- All styling should not use JS manipulations, pure CSS only
- Page shall look unbroken on either Chrome or Firefox plus any mobile device (or device emulator in Chrome)
- Page shall have a long sample text (lorem ipsum?) to make sure scroll appears
- Page shall have a button somewhere that calls a popup centered both vertically and horizontally
- Popup should be a proper modal popup - no scrolling of the content under it, page content becomes inaccessible
- Popup has a close icon in the corner, a title on the top, a short sample text in the middle and a button on the bottom
- Popup must always fit into the viewport, thus popup inner text might become scrollable if necessary
- Minimal gaps from the popup sides to the viewport shall reduce when the viewport gets reduced:
  - On desktop (1200 pixels wide or more) minimal gaps shall be quite noticeable (at least 150 pixels)
  - When viewport size gets reduced (DevTools/window resizing) gaps shall become smaller and smaller
  - On some small device (500 pixels wide or less) gaps shall become zero, so the popup edges will touch viewport
- Popup shall have a maximum width of 600 pixels, so on a desktop side gaps will be huge, unlike top/bottom ones potentially
- Viewport orientation shall not be considered, all sizing rules shall only base on its width
- When popup content is small enough:
  - nothing is scrollable
  - popup shall shrink to fit the content height, so gaps to the viewport edges might become bigger
- When popup content is too big:
  - popup inner text shall become scrollable
  - title should stick to the top of the popup (never scrolls with text below)
  - button should stick to the bottom of the popup (never scrolls with text above)
  - gaps from popup sides to viewport edges become smallest allowed
- Popup button click shall toggle between short and long sample text, so on high resolution:
  - small text will fit into popup without scrolling
  - long text will become scrollable
- All content (page html, short popup html and long popup html) shall be loaded from the back-end
- After some content gets loaded for the first time it should not be re-requested from the back-end
- Page is blank at start, initial page load shall trigger page content load
- As soon as page content becomes available it is shown on the page
- Popup call button should come inside the page content html and becomes visible with the rest of it
- Initial popup open shall trigger short popup content load (becomes visible after the load)
- First click on the button inside the popup shall trigger long popup content load (displayed when it gets loaded)
- Further clicks on the button inside the popup shall switch popup content to short/long forever
