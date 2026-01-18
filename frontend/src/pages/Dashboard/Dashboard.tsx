import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { WidgetType } from 'types/widget.types';
import { DashboardHeader, LeftPanel, Widget } from './components';
import styles from './dashboard.styles';
// @ts-ignore
import { ApproveRelease, GetSlots, RejectRelease } from './widgets';

const dashboardWidgets: WidgetType[] = [
  {
    title: 'All Releases',
    widget: GetSlots,
    description: 'Read-only query that lists release from the contract'
  },
  {
    title: 'Approve Release',
    widget: ApproveRelease,
    description: 'Approve a proposed release on-chain'
  },
  {
    title: 'Reject Release',
    widget: RejectRelease,
    description: 'Reject a proposed release on-chain'
  }
];

export const Dashboard = () => {
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);

  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  return (
    <div className={styles.dashboardContainer}>
      <div
        className={classNames(
          styles.mobilePanelContainer,
          styles.desktopPanelContainer
        )}
      >
        <LeftPanel
          isOpen={isMobilePanelOpen}
          setIsOpen={setIsMobilePanelOpen}
        />
      </div>

      <div
        style={{ backgroundImage: 'url(/background.svg)' }}
        className={classNames(styles.dashboardContent, {
          [styles.dashboardContentMobilePanelOpen]: isMobilePanelOpen
        })}
      >
        <DashboardHeader />

        <div className={styles.dashboardWidgets}>
          {dashboardWidgets.map((element) => (
            <Widget key={element.title} {...element} />
          ))}
        </div>
      </div>
    </div>
  );
};
