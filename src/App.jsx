import { PixelProvider } from './state/PixelContext.jsx';
import { HeaderBar } from './components/HeaderBar/HeaderBar.jsx';
import { LeftSidebar } from './components/LeftSidebar/LeftSidebar.jsx';
import { PixelGrid } from './components/PixelGrid/PixelGrid.jsx';
import { RightSidebar } from './components/RightSidebar/RightSidebar.jsx';
import { BottomBar } from './components/BottomBar/BottomBar.jsx';
import styles from './App.module.css';

export default function App() {
  return (
    <PixelProvider>
      <div className={styles.app}>
        <HeaderBar />
        <LeftSidebar />
        <PixelGrid />
        <RightSidebar />
        <BottomBar />
      </div>
    </PixelProvider>
  );
}
