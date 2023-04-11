/**
 * Get absolute version of relative URL.
 *
 * @function
 * @param    {string} url
 *           URL to make absolute
 *
 * @return   {string}
 *           Absolute URL
 *
 * @see      http://stackoverflow.com/questions/470832/getting-an-absolute-url-from-a-relative-one-ie6-issue
 */
export const getAbsoluteURL = function (url: string) {
  // Check if absolute URL
  if (!url.match(/^https?:\/\//)) {
    // Add the url to an anchor and let the browser parse it to convert to an absolute url
    const a = document.createElement("a");

    a.href = url;

    url = a.href;
  }

  return url;
};

/**
 * Returns the extension of the passed file name. It will return an empty string
 * if passed an invalid path.
 *
 * @function
 * @param    {string} path
 *           The fileName path like '/path/to/file.mp4'
 *
 * @return  {string}
 *           The extension in lower case or an empty string if no
 *           extension could be found.
 */
export const getFileExtension = function (path: string) {
  if (typeof path === "string") {
    const splitPathRe =
      /^(\/?)([\s\S]*?)((?:\.{1,2}|[^\/]+?)(\.([^\.\/\?]+)))(?:[\/]*|[\?].*)$/;
    const pathParts = splitPathRe.exec(path);

    if (pathParts) {
      return pathParts.pop()!.toLowerCase();
    }
  }

  return "";
};