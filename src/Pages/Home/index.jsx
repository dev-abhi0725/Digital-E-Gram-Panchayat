import Slider from "react-slick";
import Banner1 from "../../assets/images/banner1.jpg";
import Banner2 from "../../assets/images/banner2.jpg";
import Banner3 from "../../assets/images/banner3.jpg";
import Banner4 from "../../assets/images/banner4.webp";


const Home = () => {

    var settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows:true,
        autoplay: true,
      };

  return (
    <>
      <div className="homeBannerSection">
        <Slider {...settings}>
            <div className="item">
                <img src={Banner1} alt="Banner1" className="w-100"/>
            </div>
            <div className="item">
                <img src={Banner2} alt="Banner2" className="w-100"/>
            </div>
            <div className="item">
                <img src={Banner3} alt="Banner3" className="w-100"/>
            </div>
            <div className="item">
                <img src={Banner4} alt="Banner4" className="w-100"/>
            </div>
            
        </Slider>
      </div>
    </>
  );
};

export default Home;
