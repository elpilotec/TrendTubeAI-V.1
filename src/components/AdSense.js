import React, { useEffect } from 'react';

const AdSense = ({ adSlot, style, format, responsive }) => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error('Error al cargar el anuncio de AdSense:', error);
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={style || { display: 'block' }}
      data-ad-client="ca-pub-4873375803261906"
      data-ad-slot={adSlot}
      data-ad-format={format || 'auto'}
      data-full-width-responsive={responsive}
    />
  );
};

export default AdSense;