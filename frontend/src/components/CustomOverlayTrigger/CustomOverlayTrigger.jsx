import { useState } from "react";
import { OverlayTrigger, Popover } from "react-bootstrap";

const CustomOverlayTrigger = ({ prefix, actions }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  let timeout = null;

  const handleMouseEnterOnTrigger = () => {
    timeout = setTimeout(() => setIsOpen(true), 400);
  }

  const handleMouseLeaveOnTrigger = () => {
    if(timeout) clearTimeout(timeout);
    timeout = null;
    setIsOpen(false);
  };

  const handleMouseEnterOnPopover = () => setIsOpen(true);
  const handleMouseLeaveOnPopover = () => setIsOpen(false);

  const handleOnPopoverClick = () => {
    if(timeout) clearTimeout(timeout);
    timeout = null;
    setIsOpen(false);
  }

  return (
    <OverlayTrigger
      trigger={["hover", "focus"]}
      placement="auto-start"
      show={isOpen}
      rootClose={false}
      onHide={() => setIsOpen(false)}
      overlay={
        <Popover
          style={{ borderRadius: "0px" }}
          onMouseEnter={handleMouseEnterOnPopover}
          onMouseLeave={handleMouseLeaveOnPopover}
        >
          <Popover.Body
            className={`${prefix}-menu-items`}
            onClick={handleOnPopoverClick}
          >
            {actions}
          </Popover.Body>
        </Popover>
      }
    >
      <span
        className="badge text-bg-secondary"
        title="More options"
        onMouseEnter={handleMouseEnterOnTrigger}
        onMouseLeave={handleMouseLeaveOnTrigger}
      >
        ...
      </span>
    </OverlayTrigger>
  )
}

// const CustomOverlayTrigger = ({ prefix, actions }) => {
//   const [isTriggerHover, setIsTriggerHover] = useState(false);
//   const [isPopoverHover, setIsPopoverHover] = useState(false);
//   const [show, setShow] = useState(false);

//   const handleOnTriggerMouseEnter = () => setIsTriggerHover(true);
//   const handleOnTriggerMouseLeave = () => setIsTriggerHover(false);

//   const handleOnPopoverMouseEnter = () => setIsPopoverHover(true);
//   const handleOnPopoverMouseLeave = () => setIsPopoverHover(false);

//   const handleOnPopoverClick = () => {
//     setShow(false);
//   }

//   useEffect(() => {
//     let hoverTimeout;

//     // console.log("If block - before timeout, isTriggerHover -", isTriggerHover, "isPopoverHowver -", isPopoverHover, "isShow -", show);
    
//     if(isTriggerHover || isPopoverHover) {
//       hoverTimeout = setTimeout(() => {
//         setShow(true);
        
//         // console.log("If block - after timeout, isTriggerHover -", isTriggerHover, "isPopoverHowver -", isPopoverHover, "isShow -", show);
//       }, TIMEOUT_DURATION); 
//     }
//     else {
//       // console.log("Else block - before timeout, isTriggerHover -", isTriggerHover, "isPopoverHowver -", isPopoverHover, "isShow -", show);
      
//       hoverTimeout = setTimeout(() => {
//         if(show) setShow(false);
        
//         // console.log("Else block - after timeout, isTriggerHover -", isTriggerHover, "isPopoverHowver -", isPopoverHover, "isShow -", show);
//       }, TIMEOUT_DURATION);
//     }

//     return () => {
//       if(hoverTimeout) clearTimeout(hoverTimeout);
//     }
//   }, [isTriggerHover, isPopoverHover]);

//   return (
//     <OverlayTrigger
//       show={show}
//       placement="auto-start"
//       overlay={
//         <Popover
//           style={{ borderRadius: "0px" }}
//           onMouseEnter={handleOnPopoverMouseEnter}
//           onMouseLeave={handleOnPopoverMouseLeave}
//         >
//           <Popover.Body
//             className={`${prefix}-menu-items`}
//             onClick={handleOnPopoverClick}
//           >
//             {actions}
//           </Popover.Body>
//         </Popover>
//       }
//     >
//       <span
//         className="badge text-bg-secondary"
//         title="More options"
//         onMouseEnter={handleOnTriggerMouseEnter}
//         onMouseLeave={handleOnTriggerMouseLeave}
//       >
//         ...
//       </span>
//     </OverlayTrigger>
//   );
// };

export default CustomOverlayTrigger;