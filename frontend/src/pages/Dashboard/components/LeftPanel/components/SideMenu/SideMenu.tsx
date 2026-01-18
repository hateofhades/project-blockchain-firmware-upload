import { faBan, faCheckDouble, faChevronUp, faListCheck, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import { useState } from 'react';
import { ItemsIdentifiersEnum } from 'pages/Dashboard/dashboard.types';
import { ItemIcon } from './components';
import styles from './sideMenu.styles';
import { MenuItemsType, SideMenuPropsType } from './sideMenu.types';

const menuItems: MenuItemsType[] = [
  {
    title: 'All Releases',
    icon: faListCheck,
    id: ItemsIdentifiersEnum.getSlots
  },
  {
    title: 'Approve Release',
    icon: faCheckDouble,
    id: ItemsIdentifiersEnum.approveRelease
  },
  {
    title: 'Reject Release',
    icon: faBan,
    id: ItemsIdentifiersEnum.rejectRelease
  },
  {
    title: 'Propose Release',
    icon: faPaperPlane,
    id: ItemsIdentifiersEnum.proposeRelease
  }
];

export const SideMenu = ({ setIsOpen }: SideMenuPropsType) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState(ItemsIdentifiersEnum.getSlots);

  const toggleCollapse = () => {
    setIsCollapsed((isCollapsed) => !isCollapsed);
  };

  const handleMenuItemClick = (id: ItemsIdentifiersEnum) => {
    setIsOpen(false);
    const target = document.getElementById(id);
    if (target) {
      const y = target.getBoundingClientRect().top + window.scrollY - 250;
      window.scrollTo({ top: y, behavior: 'smooth' });

      setActiveItem(id);
    }
  };

  return (
    <div className={styles.sideMenuContainer}>
      <div className={styles.sideMenuHeader}>
        <h2 className={styles.sideMenuHeaderTitle}>Library</h2>

        <FontAwesomeIcon
          icon={faChevronUp}
          className={classNames(styles.sideMenuHeaderIcon, {
            [styles.sideMenuHeaderIconRotated]: isCollapsed
          })}
          onClick={toggleCollapse}
        />
      </div>

      <div
        className={classNames(styles.sideMenuItems, {
          [styles.sideMenuItemsHidden]: isCollapsed
        })}
      >
        {menuItems.map((item) => (
          <div
            key={item.id}
            onClick={() => handleMenuItemClick(item.id)}
            className={classNames(styles.sideMenuItem, {
              [styles.sideMenuItemActive]: item.id === activeItem
            })}
          >
            {item.icon && <ItemIcon icon={item.icon} />}

            <div className={styles.sideMenuItemTitle}>{item.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
