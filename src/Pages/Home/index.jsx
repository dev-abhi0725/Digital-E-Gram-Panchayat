
import Slider from "react-slick";
import Banner1 from "../../assets/images/banner1.jpg";
import Banner2 from "../../assets/images/banner2.jpg";
import Banner3 from "../../assets/images/banner3.jpg";
import Banner4 from "../../assets/images/banner4.webp";
import CmImage from "../../assets/images/cm.png"; 

const Home = () => {
  var settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 2000,
    
  };

  return (
    <>
      {/* Banner Section */}
      <div className="homeBannerSection">
        <Slider {...settings}>
          <div className="item">
            <img src={Banner1} className="w-100 img-fluid" alt="Banner 1" />
          </div>
          <div className="item">
            <img src={Banner2} className="w-100 img-fluid" alt="Banner 2" />
          </div>
          <div className="item">
            <img src={Banner3} className="w-100 img-fluid" alt="Banner 3" />
          </div>
          <div className="item">
            <img src={Banner4} className="w-100 img-fluid" alt="Banner 4" />
          </div>
        </Slider>
      </div>

      {/* About Jharkhand Section */}
      <div className="container my-5">
        <h1 className="text-center mb-4 ">About Jharkhand</h1>
        <div className="row align-items-center">
          {/* Left - CM Image */}
          <div className="col-md-4 text-center mb-3 mb-md-0">
            <img
              src={CmImage}
              alt="Chief Minister of Jharkhand"
              className="img-fluid rounded shadow"
              style={{ maxHeight: "300px", objectFit: "cover" }}
            />
            <p className="mt-2 fw-bold">Hon’ble Chief Minister</p>
          </div>

          {/* Right - Intro */}
          <div className="col-md-8">
            <p >
              Jharkhand, carved out of Bihar in the year 2000, is known as the
              “Land of Forests”. It is rich in minerals, natural beauty, and
              cultural heritage. Ranchi serves as the capital city, while the
              state is home to numerous waterfalls, national parks, and tribal
              traditions. Jharkhand plays a crucial role in India’s industrial
              sector with abundant resources like coal, iron ore, and steel.
            </p>
            <p >
              The government is dedicated to sustainable development,
              empowerment of tribal communities, and preserving its natural
              wealth while ensuring modern growth.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-dark text-white text-center py-3 mt-5">
        Made with <span style={{ color: "red" }}>❤</span> by Abhi
      </footer>
    </>
  );
};

export default Home;
