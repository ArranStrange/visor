import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Card } from "@mui/material";
import { SystemStyleObject, Theme } from "@mui/system";
import { useNavigate } from "react-router-dom";
import { useMobileDetection } from "@/hooks/useMobileDetection";
import { getCardHoverStyles } from "../../theme/cardOverlays";

export interface CardShellRenderState {
  isHovered: boolean;
  isMobile: boolean;
  showOptions: boolean;
}

interface CardShellProps {
  aspectRatio: string;
  navigateTo: string;
  renderMedia: (state: CardShellRenderState) => React.ReactNode;
  children: React.ReactNode;
  navigationBlocked?: boolean;
  revealOnMobileTap?: boolean;
  revealOptionsOnHover?: boolean;
  cardSx?: SystemStyleObject<Theme>;
}

function CardShell({
  aspectRatio,
  navigateTo,
  renderMedia,
  children,
  navigationBlocked = false,
  revealOnMobileTap = true,
  revealOptionsOnHover = false,
  cardSx,
}: CardShellProps) {
  const navigate = useNavigate();
  const isMobile = useMobileDetection();
  const [showOptions, setShowOptions] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!isMobile && showOptions) {
      const timer = setTimeout(() => setShowOptions(false), 3000);
      return () => clearTimeout(timer);
    }
    if (isMobile && !showOptions) {
      setIsHovered(false);
    }
  }, [showOptions, isMobile]);

  const handleCardClick = useCallback(() => {
    if (navigationBlocked) return;

    if (isMobile && revealOnMobileTap && !showOptions) {
      setShowOptions(true);
      setIsHovered(true);
      return;
    }

    navigate(navigateTo);
  }, [
    isMobile,
    navigate,
    navigateTo,
    navigationBlocked,
    revealOnMobileTap,
    showOptions,
  ]);

  const cardStyles = useMemo(
    () => ({
      position: "relative" as const,
      aspectRatio,
      borderRadius: 1,
      cursor: "pointer",
      overflow: "hidden",
      ...getCardHoverStyles(showOptions),
      ...cardSx,
    }),
    [aspectRatio, cardSx, showOptions]
  );

  const renderState = { isHovered, isMobile, showOptions };

  return (
    <Card
      sx={cardStyles}
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {renderMedia(renderState)}
      {children}
    </Card>
  );

  function handleMouseEnter() {
    setIsHovered(true);
    if (revealOptionsOnHover) setShowOptions(true);
  }

  function handleMouseLeave() {
    setIsHovered(false);
    if (revealOptionsOnHover) setShowOptions(false);
  }
}

export default CardShell;
