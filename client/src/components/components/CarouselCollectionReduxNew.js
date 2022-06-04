import React, { memo, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import Slider from "react-slick";
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { settingsnew } from "./constants";
import CustomSlide from "./CustomSlide";
import * as selectors from '../../store/selectors';
import { fetchHotCollections } from "../../store/actions/thunks";
import api from "../../core/api";
import {useFetchCollections} from '../hooks/collections';

const CarouselCollectionRedux = () => {

  const dispatch = useDispatch();
  const { data: collections, status: colStatus } = useFetchCollections();
  const hotCollectionsState = useSelector(selectors.hotCollectionsState);
  const hotCollections = hotCollectionsState.data ? hotCollectionsState.data : [];

  useEffect(() => {
    dispatch(fetchHotCollections());
}, [dispatch]);

  return (
    <div className='nft'>
      <Slider {...settingsnew}>
        {colStatus === 'loading' && <div>Loading...</div>}
        {colStatus === 'success' &&
          collections &&
          collections?.map((item, index) => (
            <CustomSlide
              key={index}
              index={index + 1}
              avatar={item?.imageUrl}
              banner={item?.coverUrl}
              username={item?.name}
              uniqueId={index + 1}
              collectionId={item?.itemId}
            />
          ))}
      </Slider>
    </div>
  );
}

export default memo(CarouselCollectionRedux);
