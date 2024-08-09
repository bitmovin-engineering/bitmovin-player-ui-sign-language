import { SelectBox } from '../selectbox'; // Adjust the path as needed
import { ListSelectorConfig } from '../listselector';
import { UIInstanceManager } from '../../uimanager';
import { PlayerAPI } from 'bitmovin-player';

export interface PositionSelectBoxConfig extends ListSelectorConfig {
  // Additional configuration options for PositionSelectBox can go here
}

export class PositionSelectBox extends SelectBox {
  private positions: string[] = ['drag-and-drop', 'off'];
  private lastPosition: { left: string, top: string } | null = null; // To store the last known position

  constructor(config: PositionSelectBoxConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClasses: ['ui-positionselectbox'], // Update the CSS class as needed
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    // Add position options dynamically
    this.positions.forEach(position => this.addItem(position, this.formatPositionLabel(position)));

    this.onItemSelected.subscribe((sender: PositionSelectBox, value: string) => {
      this.applyPosition(value);
    });

    // Set default value to 'off'
    this.selectItem('off');
  }

  private formatPositionLabel(position: string): string {
    return position;
  }

  private applyPosition(position: string): void {
    const avatarContainer = document.querySelector('.container-avatar') as HTMLElement;

    if (avatarContainer) {
      if (position === 'off') {
        this.lastPosition = {
          left: avatarContainer.style.left,
          top: avatarContainer.style.top,
        };
        avatarContainer.setAttribute('draggable', 'false');
      } else if (position === 'drag-and-drop') {
        if (this.lastPosition) {
          avatarContainer.style.left = this.lastPosition.left;
          avatarContainer.style.top = this.lastPosition.top;
        }
        avatarContainer.setAttribute('draggable', 'true');
        this.enableDragAndDrop(avatarContainer);
      }
    }
  }

  private enableDragAndDrop(element: HTMLElement): void {
    let isDragging = false;
    let startX: number, startY: number, initialX: number, initialY: number;

    element.setAttribute('draggable', 'true');

    element.addEventListener('dragstart', (event) => {
      isDragging = true;
      startX = event.clientX;
      startY = event.clientY;
      initialX = element.offsetLeft;
      initialY = element.offsetTop;
      element.style.opacity = '0.5'; // Optional: make it clear that the avatar is being dragged
    });

    element.addEventListener('dragend', (event) => {
      isDragging = false;
      element.style.opacity = '1';
      const deltaX = event.clientX - startX;
      const deltaY = event.clientY - startY;
      element.style.left = `${initialX + deltaX}px`;
      element.style.top = `${initialY + deltaY}px`;

      // Update the lastPosition when dragging ends
      this.lastPosition = {
        left: element.style.left,
        top: element.style.top,
      };
    });

    element.addEventListener('dragover', (event) => {
      event.preventDefault(); // Necessary to allow dropping
    });
  }
}
