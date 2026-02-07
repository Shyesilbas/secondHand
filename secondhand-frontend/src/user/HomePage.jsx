import {usePageTheme} from '../common/theme/usePageTheme.js';
import {HomePageTheme} from '../home/themes/index.js';
import {MostFavoritedSection, ShowcaseSection} from '../home/components/index.js';

const HomePage = () => {
  usePageTheme(HomePageTheme);

  return (
    <div className="min-h-screen bg-white">
      <ShowcaseSection />
      <MostFavoritedSection />
    </div>
  );
};

export default HomePage;
