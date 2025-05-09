/* global Fancybox */

document.addEventListener('page:loaded', () => {

  if (typeof Fancybox !== 'undefined') {
    Fancybox.defaults.Hash = false;
    Fancybox.defaults.Thumbs = false;
  }

  /**
   * Wrap images with fancybox.
   */
  document.querySelectorAll('.post-body :not(a) > img, .post-body > img').forEach(image => {
    if (image.classList.contains('nofancybox')){  //是否有包含自己定义的nofancybox属性，有就return true
      image.style.cursor = 'default';    //将碰到图片的鼠标从放大镜变成default模式
      return;	//不进行下面的fancybox的配置
    }
    
    const imageLink = image.dataset.src || image.src;
    const imageWrapLink = document.createElement('a');
    imageWrapLink.classList.add('fancybox');
    imageWrapLink.href = imageLink;
    imageWrapLink.setAttribute('itemscope', '');
    imageWrapLink.setAttribute('itemtype', 'http://schema.org/ImageObject');
    imageWrapLink.setAttribute('itemprop', 'url');

    let dataFancybox = 'default';
    if (image.closest('.post-gallery') !== null) {
      dataFancybox = 'gallery';
    } else if (image.closest('.group-picture') !== null) {
      dataFancybox = 'group';
    }
    imageWrapLink.dataset.fancybox = dataFancybox;

    const imageTitle = image.title || image.alt;
    if (imageTitle) {
      imageWrapLink.title = imageTitle;
      // Make sure img captions will show correctly in fancybox
      imageWrapLink.dataset.caption = imageTitle;
    }
    image.wrap(imageWrapLink);
  });

  Fancybox.bind('[data-fancybox]');
});
