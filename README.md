# Dynamic Page

This repository is, in fact, an answer to the question initially raised by [Gamesys](https://www.gamesysgroup.com). You can check [ASSIGNMENT.md](ASSIGNMENT.md) to see the full assignment instructions.

## Hints

- As mentioned by many sources, testing beans and RESTful endpoints are not classified as Unit Tests because they are not units and are not related to the business logic. Since Unit Tests are the only tests wanted by the instructions, there were only two Service implementation public methods to test.
- `F` represents Front-End and `B` represents Back-End in the rest of the document.

## Features

- Implemented as a single page of a bigger project `F` `B`
- Provides two caching layers `F` `B`
- Adding a new page is as easy as adding a `{FILENAME}.html` in `recources/templates/partials` directory `F` `B`
- Provides the ability to load partials in page, modal, or a custom target `F`
- Supports initial and lazy loading of contents `F`
- Provides `404` template `F` `B`
- Provides a default template for contents with no template `F`
- Provides a demo list which demonstrates most of the features in action `F`
- Supports common keyboard shortcuts (like `Escape` for closing modals) `F`
- Tries to implement best practices of accessibility `F`
- Responsive and UX-aware UI development `F`

## Todos

- Switching from the callback approach to the event-based one `F`
- Choosing better names for methods `F` `B`
- Thinking about Server Side Rendering(SSR) at least for SEO `B`
- Adding a hash to URL on modal open to be able to retore it on page reload `F`
- Fixing content header on scroll `F`
- Lazyloading the images (load them only when they are in the viewport) `F`
- Writing Integration and System tests `B`
- Writing Unit, Regression, and End-to-End tests `F`
