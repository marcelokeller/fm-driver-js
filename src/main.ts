import "../styles/fm-variables.css";
import "../styles/driver-theme.css";
import "driver.js/dist/driver.css";

import { Config, DriveStep, driver } from "driver.js";
import { sendGAEvent } from "./utilities";

/**
 * Extra config for guided tour
 */
type CustomDriveConfig = {
  /**
   * LocalStorage key name to avoid repeating guided tour
   */
  tourKey?: string;
  /**
   * Forces the tour always show, even if localStorage key is set
   */
  force?: boolean;
  /**
   * Activate GA tracking 
   */
  gaTracking?: boolean;
  /**
   * GA custom Event Category
   */
  gaEventCategory?: string;
};

const defaultOptions: Partial<Config> = {
  animate: true,
  overlayColor: "rgba(1, 7, 31, 0.6)",
  showButtons: ["close", "next", "previous"],
  showProgress: false,
  nextBtnText: "Próximo",
  prevBtnText: "Voltar",
  doneBtnText: "Fechar",
  progressText: "{{current}} de {{total}}",
  popoverClass: "fm-driver-theme",
};

/**
 * Fatal Model Customized wrapper around the driver.js lib
 * - Allows visibility control through localStorage key storage. 
 * - Sends GA Events; 
 * - Implements brand colors and font; 
 */
export class CustomDriver {
  private driver: ReturnType<typeof driver>;
  private tourKey?: string;
  private config?: CustomDriveConfig;

  /**
   * @constructor
   * Creates a new custom Driver.js instance
   * @param{DriveStep[]} steps - The steps of the guided tour
   * @param{Config} options - Refers to Driver.js config options {@link https://driverjs.com/docs/configuration}
   * @param{CustomDriveConfig} config - Object with custom Driver.js configuration options
  */
  constructor(
    steps: DriveStep[],
    options?: Partial<Config>,
    config?: CustomDriveConfig
  ) {
    this.driver = driver({
      ...defaultOptions,
      ...options,
      onCloseClick: (_el, _state, { driver }) => {
        if (this.config?.gaTracking) {
          console.log("sending tour_closed");

          sendGAEvent(
            "tour_closed",
            this.config?.gaEventCategory,
            this.tourKey
          );
        }

        driver.destroy();
      },
      onNextClick: (_el, _state, { driver }) => {
        if (driver.isLastStep() && this.config?.gaTracking) {
          sendGAEvent("tour_done", this.config.gaEventCategory, this.tourKey);
          driver.destroy();
        }
        driver.moveNext();
      },
    });

    this.driver.setSteps(steps);
    this.tourKey = config?.tourKey;
    this.config = config;
  }

  start() {
    if (!this.shouldRunTour()) return;

    this.driver.drive();

    if (this.config?.gaTracking) {
    }

    this.markTourAsSeen();

    if (this.driver.isLastStep()) {
      this.driver.setConfig({
        onNextClick: (_element, _step, { driver }) => {
          if (this.config?.tourKey) {
            console.log(`Sending tour_done`);

            sendGAEvent("tour_done", this.config.gaEventCategory, this.tourKey);
            driver.destroy();
          }
        },
      });
    }
  }

  getInstance() {
    return this.driver;
  }

  private shouldRunTour() {
    if (this.config?.force) return true;
    if (!this.config?.tourKey) return true;

    return !localStorage.getItem(this.config?.tourKey);
  }

  private markTourAsSeen() {
    if (this.config?.tourKey) {
      localStorage.setItem(this.config?.tourKey, "true");
    }
  }
}

