'use strict';

var app = { base: { fn: {}, vars: {} } };

/*==========================================
=            Defining Variables            =
==========================================*/

app.base.vars = {
	baseAppUrl: '/',
	loadedContents: {},
	loadingClass: 'is--loading',
	visibleClass: 'is--visible',
	htmlNotScrollableClass: 'not--scrollable',
	documentBaseTitle: document.title,
	pathSlashAlternativeForPartialSlug: '__',
	contentApiUrlPartialVariable: 'PARTIAL',
	contentApiUrl: '/api/v1/content/{{PARTIAL}}',
	documentTitleSeperator: ' — ',
	probablePageExtensions: ['.html'],
	homepagePartialSlug: 'home',
	currentPagePartialSlug: '{{CURRENT_PAGE}}',
	modalTemplatePartialSlug: 'modal-template',
	contentTemplatePartialSlug: 'content-template',
	partialSlugDataAttr: 'data-partial',
	partialLoadedDataAttr: 'data-partial-loaded',
	errorCodeTemplate:
		'<span class="error-code">' +
		'<strong class="error-code__label">Error Code:</strong>' +
		'<code class="error-code__code">{{ERROR_CODE}}</code>' +
		'</span>',
	errorCodeVariable: 'ERROR_CODE',
	errorMessageTemplate: '<span class="error-message">{{ERROR_MESSAGE}}</span>',
	errorMessageVariable: 'ERROR_MESSAGE',
	ajaxTriggerSelector:
		'a:not([target])' +
		':not([href^="#"])' +
		':not([disabled])' +
		':not([aria-disabled="true"])' +
		':not([data-ajax-prevent])' +
		',[{{AJAX_ULR_DATA_ATTR}}]',
	ajaxTriggerSelectorUrlAttrVariable: 'AJAX_ULR_DATA_ATTR',
	ajaxUrlDataAttr: 'data-ajax-url',
	ajaxTargetDataAttr: 'data-ajax-target',
	defaultAjaxError: 'Sorry, something wrong occured! :(',
	emptyResponseAjaxError: 'Sorry, nothing received! :(',
	modalTriggerDataAttr: 'data-show-in-modal',
	modalCloseSelector: '[data-modal-close]',
	modalTitleDataAttr: 'data-modal-title',
	contentContainerSelector: '.content',
	contentWrapperSelector: '.content-body__inner',
	partialTitleSelector: '[data-partial-title]',
	partialContentSelector: '[data-partial-content]',
	modalSelector: '.modal',
	modalFooterSelector: '.modal__footer',
	modalFooterContentSelector: '[data-modal-footer-content]',
	modalTemplateTitleVariable: 'MODAL_TITLE',
	modalTemplateFooterContentVariable: 'MODAL_FOOTER_CONTENT',
	modalTemplateContentVariable: 'MODAL_CONTENT',
	customContentHeaderSelector: '.content__header',
	customContentBodyTemplateVariable: 'CONTENT_BODY',
	customContentHeaderTemplateVariable: 'CONTENT_HEADER',
};

/*============================================
=            Extending Prototypes            =
============================================*/

// Polyfill the `matches` method for old browsers
this.Element &&
	(function(ElementPrototype) {
		ElementPrototype.matches =
			ElementPrototype.matches ||
			ElementPrototype.matchesSelector ||
			ElementPrototype.webkitMatchesSelector ||
			ElementPrototype.msMatchesSelector ||
			function(selector) {
				var node = this,
					nodes = (node.parentNode || node.document).querySelectorAll(selector),
					i = -1;
				while (nodes[++i] && nodes[i] != node);
				return !!nodes[i];
			};
	})(Element.prototype);

/*==========================================
=            Defining Functions            =
==========================================*/

app.base.fn = {
	// The start!
	init: function() {
		// Bind events and start loading partials recursively
		app.base.fn.registerEvents();
		app.base.fn.fetchLoadableContents();
	},

	// Polyfill `addEventListener` for IE
	addEvent: function(el, type, handler) {
		if (el.attachEvent) el.attachEvent('on' + type, handler);
		else el.addEventListener(type, handler);
	},

	// Bind events to the document element (by default), so the newly
	// added elements can also trigger the hooked events in the future
	live: function(selector, event, callback, context) {
		app.base.fn.addEvent(context || document, event, function(e) {
			var found,
				el = e.target || e.srcElement;
			// Search for the desired parent of the triggered the event
			while (
				el &&
				el.matches &&
				el !== context &&
				!(found = el.matches(selector))
			)
				el = el.parentElement;
			if (found) callback.call(el, e);
		});
	},

	// Try to simulate the modern fetch API
	fetch: function(
		url,
		method,
		params,
		callback,
		callstart,
		successCallback,
		failCallback
	) {
		if (url) {
			var xhr = new XMLHttpRequest();
			xhr.open(method || 'GET', url);
			xhr.setRequestHeader('Content-Type', 'application/json');
			xhr.onload = function() {
				var status = xhr.status,
					response = xhr.responseText,
					// Check if status code is in the range of 200
					successful = status >= 200 && status - 200 < 100;
				// Parse the reponse string as JSON whenever possible
				try {
					response = JSON.parse(response);
				} catch (e) {}
				// Check whether the request was succussful
				if (
					response &&
					typeof response === 'object' &&
					response.success !== undefined
				) {
					successful = response.success;
				}
				// Call specific callbacks upon each status
				if (successful) {
					typeof failCallback === 'function' &&
						successCallback(response, status);
				} else {
					typeof failCallback === 'function' && failCallback(response, status);
				}
				typeof callback === 'function' &&
					callback(response, successful, status);
			};
			xhr.onerror = function() {
				// Catch the unexpected exception which failed the request
				typeof callback === 'function' &&
					callback(app.base.vars.defaultAjaxError, false, -1);
				typeof failCallback === 'function' &&
					failCallback(app.base.vars.defaultAjaxError, -1);
			};
			// Run the starting functionalities before starting the request. The `xhr`
			// variable passed will be used to abort the connection in the future
			typeof callstart === 'function' && callstart(xhr);
			xhr.send(
				encodeURI(
					// Pass the input parameters if provided (which can be used for POST requests)
					JSON.stringify(params && typeof params === 'object' ? params : {})
				)
			);
		} else {
			// Call failure callbacks if no URL is provided
			typeof failCallback === 'function' &&
				failCallback(app.base.vars.defaultAjaxError, 0);
			typeof callback === 'function' &&
				callback(app.base.vars.defaultAjaxError, false, 0);
		}
	},

	setPageTitle: function(title) {
		document.title =
			app.base.vars.documentBaseTitle +
			(title ? app.base.vars.documentTitleSeperator + title : '');
	},

	// Replace the variables with corresponding
	// values in the given template (something like Mustache)
	setTemplateVariables: function(template, values) {
		// Check if key/value pairs are served as an object
		if (template && values && typeof values === 'object') {
			Object.keys(values).forEach(function(variable) {
				// Will find the key (variable) in each iteration
				// and replace it with the given value
				template = template
					.split('{{' + variable + '}}')
					.join(values[variable] || '');
			});
		}
		return template;
	},

	// Generate a partial slug based on a given name/URL
	getPartialSlug: function(partial) {
		// Check if the given partial name/path is a non-empty String
		if (partial && typeof partial === 'string') {
			// Run a simple test to detect if the provided
			// `partial` argument is a name or a URL
			var isUrl = partial.indexOf('/') !== -1;
			if (isUrl) {
				// Oldschool method for extracting URL parts without
				// using any complicated RegExp or modern Web APIs
				var partialLink = document.createElement('a');
				partialLink.setAttribute('href', partial);
				var isFromSameHost = partialLink.host === document.location.host;
				// Generate the slug only based on the pathname
				// and only for the URLs with the same domain/host
				partial = isFromSameHost ? partialLink.pathname : null;
			}
			// Check if it is a partial name
			// or a URL from the same host
			if (isFromSameHost || !isUrl) {
				// Replace current page variable in partial name
				// with the pathname of the current document
				if (partial.indexOf(app.base.vars.currentPagePartialSlug) !== -1) {
					partial = partial
						.split(app.base.vars.currentPagePartialSlug)
						.join(document.location.pathname);
				}
				// Remove the base application URL from
				// the partial name (when it is a URL)
				var baseAppUrl = app.base.vars.baseAppUrl;
				if (partial.substring(0, baseAppUrl.length) === baseAppUrl) {
					partial = partial.substring(baseAppUrl.length, partial.length);
				}
				// Remove the probable webpage extensions from
				// the end of the partial name (when it is a URL)
				app.base.vars.probablePageExtensions.forEach(function(extension) {
					if (partial.substr(extension.length * -1) === extension) {
						partial = partial.substring(0, partial.length - extension.length);
					}
				});
				// @TODO: Better to include other characters like `#`
				// Replace special characters (just `/` for now) in the partial name
				// with a valid separator, so as to map it directly to the static files
				partial = partial
					.split('/')
					.filter(function(el) {
						return !!el;
					})
					.join(app.base.vars.pathSlashAlternativeForPartialSlug);
				partial = partial.length ? partial : app.base.vars.homepagePartialSlug;
			}
		}
		return partial;
	},

	// Parse API response and generate the final content
	getContentFromApiResponse: function(response, successful) {
		var content = null;
		if (!response) {
			// If the response is NULL or a zero-length string we
			// should throw an error even if `succussful` is TRUE
			content = successful
				? app.base.vars.emptyResponseAjaxError
				: app.base.vars.defaultAjaxError;
		} else if (typeof response === 'string') {
			// Return the response as is, if it is a string. This
			// may occur when a simple string is returned from the
			// API rather than the `ApiResponse`-typed object
			content = response;
		} else {
			/*
				An ideal/full API response is expected to have this structure:
				```
				  {
				    "success": false,
				    "error": {
				      "code": 1001,
				      "message": "Not found! :("
				    },
				    "payload": {
				      "content": "[a loaded template]"
				    }
				  }
				```
			*/
			// Check for the default `payload` structure, and then
			// other possible structures which may be used by mistake
			var payload =
				response.payload && response.payload.content
					? response.payload.content
					: typeof response.payload === 'string' && response.payload.length
					? response.payload
					: null;
			if (payload) {
				// The `payload` may be provided even if `succuss` is not
				// TRUE. For instance, an error template is served for the
				// NOT_FOUND (404) errors in addition to the error message
				content = payload;
			} else {
				if (successful) {
					// If request was successful but no payload fetched and no
					// error was thrown, it is something strange but should be catched
					content = app.base.vars.emptyResponseAjaxError;
				} else {
					// Check for the default `error` structure, and
					// then other possible structures which may be
					// used by mistake or by the Spring Boot itself
					var errorCode =
							response.error && response.error.code
								? response.error.code
								: response.status,
						codeReplace = {};
					codeReplace[app.base.vars.errorCodeVariable] = errorCode;
					// Generating the final error code by replacing
					// the error code value in the specified template
					errorCode = errorCode
						? app.base.fn.setTemplateVariables(
								app.base.vars.errorCodeTemplate,
								codeReplace
						  )
						: null;
					var errorMessage =
							response.error && response.error.message
								? response.error.message
								: response.error && typeof response.error === 'string'
								? response.error
								: null,
						messageReplace = {};
					messageReplace[app.base.vars.errorMessageVariable] = errorMessage;
					// Generating the final error message by replacing
					// the error message value in the specified template
					errorMessage = errorMessage
						? app.base.fn.setTemplateVariables(
								app.base.vars.errorMessageTemplate,
								messageReplace
						  )
						: null;
					// If one/both of the error code and error message
					// are present, we can merge them as the final output
					if (errorCode || errorMessage) {
						content = [errorCode, errorMessage]
							.filter(function(el) {
								return !!el;
							})
							.join('  ');
					} else {
						content =
							typeof response.error === 'string' && response.error.length
								? response.error
								: app.base.vars.defaultAjaxError;
					}
				}
			}
		}
		return content;
	},

	// Request for the partial content from API/cache
	getContent: function(partial, callback, callstart, force) {
		// Get the partial slug to fetch
		partial = app.base.fn.getPartialSlug(partial);
		if (partial) {
			// Load the partial content from the cache
			var content = app.base.vars.loadedContents[partial];
			// If the partial content exists in cache and
			// it is not forced to refresh it, the use it
			if (content && !force) {
				// Content is already fetched from cache, so
				// `callstart` and `callback` should be called
				typeof callstart === 'function' && callstart();
				typeof callback === 'function' && callback(content, true, 1);
			} else {
				var replace = {};
				replace[app.base.vars.contentApiUrlPartialVariable] = partial;
				// Prepare API endpoint by replacing the
				// partial slug in the specified template
				var contentApiUrl = app.base.fn.setTemplateVariables(
						app.base.vars.contentApiUrl,
						replace
					),
					// The callback which will be called
					// after the fetch request finished
					extendedCallback = function(response, successful) {
						// Parse the API response to get the content
						content = app.base.fn.getContentFromApiResponse(
							response,
							successful
						);
						// Cache the partial content only if the request
						// was successful and a meaningful content was fetched
						if (content && successful) {
							// @TODO: Store the data in LocalStorage or IndexedDB instead of a variable
							app.base.vars.loadedContents[partial] = content;
						}
						// Just to make sure that we will not ignore empty content
						// if `getContentFromApiResponse` didn't work properly
						if (!content) {
							content = app.base.vars.defaultAjaxError;
						}
						// Call the custom callback if passed
						typeof callback === 'function' && callback(content);
					};
				// Start to load
				app.base.fn.fetch(
					contentApiUrl,
					'GET',
					null,
					extendedCallback,
					callstart
				);
			}
		} else {
			// Since no partial found, error
			// will be returned as the content
			typeof callback === 'function' &&
				callback(app.base.vars.defaultAjaxError);
		}
	},

	// Find dynamic loadable partials is a specific
	// scope and fetch their content recursively
	fetchLoadableContents: function(scope, force) {
		// Consider document element as the scope when the
		// provided scope is neither provided nor valid
		scope =
			scope instanceof Element || scope instanceof HTMLDocument
				? scope
				: document;
		// Find dynamic partials in the scope to be loaded
		var toBeLoaded = scope.querySelectorAll(
			'[' +
				app.base.vars.partialSlugDataAttr +
				']' +
				// Filter previously-loaded partials when not forced
				(force ? '' : ':not([' + app.base.vars.partialLoadedDataAttr + '])')
		);
		toBeLoaded.forEach(function(element) {
			var modal = document.querySelector(app.base.vars.modalSelector),
				isModalian = false,
				node = element.parentNode;
			// Check if the dynamic partial is inside the modal
			while (node != null) {
				if (node == modal) {
					isModalian = true;
					break;
				}
				node = node.parentNode;
			}
			// Get the partial URL/name from element's data attribute
			var partial = element.getAttribute(app.base.vars.partialSlugDataAttr);
			// Fetch and load the content of the partial inside the element
			app.base.fn.loadPartial(partial, element, null, null, isModalian);
		});
	},

	// Set/Toggle the scrollbar lock status
	toggleScrollLock: function(lock) {
		var htmlClass = document.querySelector('html').classList,
			notScrollableClass = app.base.vars.htmlNotScrollableClass;
		// Set the inverse (toggled) value
		// if the lock status is not defined
		if (lock == null) {
			lock = !(htmlClass.indexOf(notScrollableClass) !== -1);
		}
		if (lock) {
			// Lock the scrollbar
			htmlClass.add(notScrollableClass);
		} else {
			// Unlock the scrollbar
			htmlClass.remove(notScrollableClass);
		}
	},

	// Set/Toggle modal visibility status
	toggleModalVisibility: function(show, xhr) {
		var visibleClass = app.base.vars.visibleClass,
			loadingClass = app.base.vars.loadingClass,
			modal = document.querySelector(app.base.vars.modalSelector);
		// Check if modal exists
		if (modal) {
			// Set the inverse (toggled) value if
			// the visibility status is not defined
			if (show == null) {
				show = !(modal.classList.indexOf(visibleClass) === -1);
			}
			// Abort any open request related to modal content
			if (app.base.vars.openModalRequest) {
				app.base.vars.openModalRequest.abort();
				app.base.vars.openModalRequest = null;
			}
			if (show === true) {
				// Store XHR object to be aborted in the future
				if (xhr) {
					app.base.vars.openModalRequest = xhr;
				}
				// Lock the scrollbar
				app.base.fn.toggleScrollLock(true);
				// Show the loading spinner
				modal.classList.add(loadingClass);
				// Show the modal overlay
				modal.classList.add(visibleClass);
			} else {
				// Unlock the scrollbar
				app.base.fn.toggleScrollLock(false);
				// Hide the loading Spinner
				modal.classList.remove(loadingClass);
				// Hide the modal
				modal.classList.remove(visibleClass);
			}
		}
	},
	prepareDataFromContent: function(content, target, title) {
		var tempElement = document.createElement('div');
		// Store the content as the HTML content of a div
		// to make it possible to query the specified selectors
		tempElement.innerHTML = content;
		// Find the title with a specific data
		// attribute inside the provided content
		var titleElement = tempElement.querySelector(
				app.base.vars.partialTitleSelector
			),
			// Find the content body with a specific
			// data attribute inside the provided content
			contentElement = tempElement.querySelector(
				app.base.vars.partialContentSelector
			),
			// Find the pure content body with a specific
			// selector inside the provided content
			contentInnerElement = tempElement.querySelector(
				app.base.vars.contentWrapperSelector
			),
			modal = document.querySelector(app.base.vars.modalSelector);
		// Some modal triggers define a custom title. That
		// specified title has priority than the one fetched
		// from the provided content
		title = title ? title : titleElement ? titleElement.innerHTML : null;
		// If target is not passed as an Element, it should be converted to
		target =
			target instanceof Element || target instanceof HTMLDocument
				? target
				: document.querySelector(target);
		// If the content wanted to be shown in modal
		if (target === modal) {
			var modalTemplate =
					// Look into the partial content cache first,
					// and if not available, the modal HTML itself
					// will be chosen as the modal template
					app.base.vars.loadedContents[
						app.base.vars.modalTemplatePartialSlug
					] || modal.parentNode.innerHTML,
				// Find the modal footer content with a specific
				// data attribute inside the provided content
				footerContent = tempElement.querySelector(
					app.base.vars.modalFooterContentSelector
				),
				tempModal = document.createElement('div');
			// Store the content as the HTML content of a div to
			// make it possible to query the specified selectors
			tempModal.innerHTML = modalTemplate;
			tempModal.innerHTML = tempModal.childNodes[0].innerHTML;
			// If no footer content provided, then the footer
			// section should be removed from the modal template
			if (!footerContent) {
				var tempModalFooter = tempModal.querySelector(
					app.base.vars.modalFooterSelector
				);
				tempModalFooter && tempModalFooter.remove();
			}
			// Replace footer and content variables in the
			// modal template with the calculated values
			var modalContentValues = {};
			modalContentValues[app.base.vars.modalTemplateTitleVariable] = title;
			modalContentValues[
				app.base.vars.modalTemplateContentVariable
			] = contentInnerElement
				? contentInnerElement.innerHTML
				: contentElement
				? contentElement.innerHTML
				: content;
			modalContentValues[
				app.base.vars.modalTemplateFooterContentVariable
			] = footerContent ? footerContent.innerHTML : null;
			content = app.base.fn.setTemplateVariables(
				tempModal.innerHTML,
				modalContentValues
			);
		}
		// If no specific content and pure-content "elements"
		// found in the provided content and the target element
		// is the main content container element of the page
		// it better to wrap the title and the content inside
		// a default content template of the page
		else if (
			!contentElement &&
			!contentInnerElement &&
			target === document.querySelector(app.base.vars.contentContainerSelector)
		) {
			var contentVariables = {},
				contentTemplate = document.querySelector(
					'[' +
						app.base.vars.partialSlugDataAttr +
						'="' +
						app.base.vars.contentTemplatePartialSlug +
						'"]'
				),
				// Look into the partial content cache first,
				// and if not available, the node HTML itself
				// will be chosen as the content template
				customContentTemplate =
					app.base.vars.loadedContents[
						app.base.vars.contentTemplatePartialSlug
					] ||
					(contentTemplate && contentTemplate.innerHTML),
				// Find the main content container
				// selector inside the provided content
				tempContentElement = tempElement.querySelector(
					app.base.vars.contentContainerSelector
				);
			// Replace title and content variables in the
			// content template with the calculated values
			contentVariables[
				app.base.vars.customContentBodyTemplateVariable
			] = tempContentElement ? tempContentElement.innerHTML : content;
			contentVariables[
				app.base.vars.customContentHeaderTemplateVariable
			] = title;
			content = app.base.fn.setTemplateVariables(
				customContentTemplate,
				contentVariables
			);
			// If no title provided, then the header section
			// should be removed from the content template
			if (!title) {
				var customContentElement = document.createElement('div');
				customContentElement.innerHTML = content;
				var customContentHeader = customContentElement.querySelector(
					app.base.vars.customContentHeaderSelector
				);
				customContentHeader && customContentHeader.remove();
				content = customContentElement.innerHTML;
			}
		}
		// Otherwise, if the `contentElement` is found then its HTML
		// should be considered as the  content and if not the pure
		// content without any manipulation should be returned
		else {
			content = contentElement ? contentElement.innerHTML : content;
		}
		return {
			title: title,
			content: content,
		};
	},
	loadPartial: function(partial, target, title, loadCallback, forceModal) {
		// Choose the main content container element of
		// the page as the target, if no target defined
		target = target || app.base.vars.contentContainerSelector;
		// Check whether the content should be
		// shown in modal after being fetched
		var needsModal = target === app.base.vars.modalSelector || forceModal;
		// @TODO: Should support multiple targets via querySelectorAll
		// If target is not passed as an Element, it should be converted to
		var targetElement =
			target instanceof Element || target instanceof HTMLDocument
				? target
				: document.querySelector(target);
		// If the target element is not
		// valid, no action should be taken
		if (targetElement) {
			// Will be called after fetch is done
			var callback = function(content) {
					if (content) {
						// Check whether the target is the
						// main content container of the page
						var isMainContent =
							target === app.base.vars.contentContainerSelector;
						// Scroll to the top of the page if the content will
						// be shown in the main content container of the page
						isMainContent && window.scrollTo(0, 0);
						// Prepare the content to be shown
						var data = app.base.fn.prepareDataFromContent(
							content,
							target,
							title
						);
						content = data.content;
						title = title || data.title;
						// Put the content into the target element
						targetElement.innerHTML = content;
						// Set the title of the page, if data is being
						// shown in the main content container of the page
						isMainContent && app.base.fn.setPageTitle(title);
						// Set a "loaded" data attribute on the target element
						// to prevent it from being loaded again in the future
						targetElement.setAttribute(
							app.base.vars.partialLoadedDataAttr,
							'true'
						);
						// Find and load the elements in the newly-added
						// content which need to be dynamically loaded
						app.base.fn.fetchLoadableContents(targetElement);
						// Call the after-load callback if available
						typeof loadCallback === 'function' &&
							loadCallback(targetElement, partial, title, content);
					}
					// If no content provided for
					// modal then it should be closed
					else if (needsModal) {
						app.base.fn.toggleModalVisibility(false);
					}
					// Hide loading spinner when request ended with success/error
					targetElement.classList.remove(app.base.vars.loadingClass);
				},
				// Will be called before fetch starts
				callstart = function(xhr) {
					// Hide/Show the modal based on the content requirement
					app.base.fn.toggleModalVisibility(needsModal, xhr);
					// Show loading spinner on the target element
					// to illustrate that its content is being loaded
					targetElement.classList.add(app.base.vars.loadingClass);
					// Remove the "loaded" data attribute from the target
					// element to illustrate that its new content is not fetched yet
					targetElement.removeAttribute(app.base.vars.partialLoadedDataAttr);
				};
			// Start to fetch the content of the specified partial
			app.base.fn.getContent(partial, callback, callstart);
		}
	},

	registerEvents: function() {
		var replace = {};
		replace[app.base.vars.ajaxTriggerSelectorUrlAttrVariable] =
			app.base.vars.ajaxUrlDataAttr;
		// Finalizing the AJAX trigger selector by including the
		// elements who have a data attribute representing the AJAX URL
		var ajaxTriggerSelector = app.base.fn.setTemplateVariables(
			app.base.vars.ajaxTriggerSelector,
			replace
		);
		// Binding a "live" `click` event to the
		// specified AJAX triggers (actually the `document`)
		app.base.fn.live(ajaxTriggerSelector, 'click', function(e) {
			// Store the clicked element
			var element = this,
				// Get the URL needs to be fetched from a specified data
				// attribute and if not available from the `href` attribute
				partial =
					element.getAttribute(app.base.vars.ajaxUrlDataAttr) ||
					element.getAttribute('href');
			// Oldschool method for extracting URL parts without
			// using any complicated RegExp or modern Web APIs
			var partialLink = document.createElement('a');
			partialLink.setAttribute('href', partial);
			var isFromSameHost = partialLink.host === document.location.host;
			// Check if partial name (content URL) is
			// provided and it is from the same host
			if (partial && isFromSameHost) {
				e.preventDefault();
				// Check whether the partial should be loaded in
				// modal by checking a specific data attribute
				var needsModal = element.getAttribute(
					app.base.vars.modalTriggerDataAttr
				);
				needsModal =
					typeof needsModal === 'string' &&
					needsModal.toLowerCase() !== 'false';
				// Get the partial content target from a
				// specific data attribute (if provided)
				var ajaxTarget = element.getAttribute(app.base.vars.ajaxTargetDataAttr),
					// Get a custom title for modal (only if the
					// content is going to be shown in the modal),
					// from a specific data attribute (if provided)
					title =
						needsModal &&
						element.getAttribute(app.base.vars.modalTitleDataAttr),
					/*
						Detect the final target of the partial content:
						  (1) Check if it needs modal (using specific data attribute)
						  (2) Check if a the custom specified target element selector
						      defined as a specific data attribute
						  (3) Use the main content container of the page as a default
					*/
					target = needsModal
						? app.base.vars.modalSelector
						: ajaxTarget
						? ajaxTarget
						: app.base.vars.contentContainerSelector,
					// After-load callback
					callback = function() {
						// Set the browser URL the same as the partial
						// name (URL) if the browser supports `history`
						// and the target of the partial content is set
						// to the main content container of the page
						if (
							!!(window.history && history.pushState) &&
							target === app.base.vars.contentContainerSelector
						) {
							history.pushState({ partial: partial }, '', partial);
						}
					};
				// Start loading the partial with the prepared properties
				app.base.fn.loadPartial(partial, target, title, callback, needsModal);
			}
		});
		// Binding an event to the next
		// or back actions of the browser
		window.addEventListener('popstate', function(e) {
			var callback = function(target, partial, title, content) {
				app.base.fn.setPageTitle(title);
			};
			// Start loading the partial content based on the
			// current location pathname and set the relative
			// page title if the content loaded successfully
			app.base.fn.loadPartial(
				// This can be replaced by the value
				// stored in the history object
				document.location.pathname,
				null,
				null,
				callback,
				false
			);
		});
		// Binding an event to the key press action
		window.addEventListener('keyup', function(e) {
			// Hide the modal if "Escape" button pressed
			e.key === 'Escape' && app.base.fn.toggleModalVisibility(false);
		});
		// Binding a "live" `click` event to the specified
		// modal close triggers (actually the `document`)
		app.base.fn.live(app.base.vars.modalCloseSelector, 'click', function(e) {
			// Hide the modal
			app.base.fn.toggleModalVisibility(false);
		});
	},
};

/*==========================================
=            Initiating the app            =
==========================================*/

(function() {
	app.base.fn.init();
})();
