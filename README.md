![Move Cookies Icon](./images/cookie_jar_128.png)

# Move Cookies

Move Cookies is a Chrome Extension made to copy/paste cookies between hosts. Move Cookies made use of the local storage to transport the cookies making no necessary the use of the clipboard, however when the action *Copy* is performed Move Cookies will copy the cookies to the clipboard also.

## Install

Go to [Move Cookies](https://chrome.google.com/webstore/detail/move-cookies/kffiikcfaacjjpmcalnafccbfebhlhkd?hl=en-GB) in the Google Web Store and press "Add to Chrome".

## Limitations

The extension api provided by Chrome don't allow the programmatically creation of cookies with a prefix, cookies whose name start with `__Host-` or `__Secure-` in a insecure web, `http://` instead of `https://`. So the extension, when pasting, rename the cookies from two underscores to one underscore (Example: `__Host` -> `_Host`) and alert the user to edit themselves the name again.

## Credits

<div>Icons made by <a href="https://www.flaticon.com/authors/freepik" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>

## License

Move Cookies is [MIT Licensed](./LICENSE)
