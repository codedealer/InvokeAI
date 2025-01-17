import {
  Divider,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Switch,
  useDisclosure,
} from '@invoke-ai/ui-library';
import { createMemoizedSelector } from 'app/store/createMemoizedSelector';
import { useAppDispatch, useAppSelector } from 'app/store/storeHooks';
import ReloadNodeTemplatesButton from 'features/nodes/components/flow/panels/TopRightPanel/ReloadSchemaButton';
import {
  selectionModeChanged,
  selectNodesSlice,
  shouldAnimateEdgesChanged,
  shouldColorEdgesChanged,
  shouldSnapToGridChanged,
  shouldValidateGraphChanged,
} from 'features/nodes/store/nodesSlice';
import type { ChangeEvent, ReactNode } from 'react';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { SelectionMode } from 'reactflow';

const selector = createMemoizedSelector(selectNodesSlice, (nodes) => {
  const { shouldAnimateEdges, shouldValidateGraph, shouldSnapToGrid, shouldColorEdges, selectionMode } = nodes;
  return {
    shouldAnimateEdges,
    shouldValidateGraph,
    shouldSnapToGrid,
    shouldColorEdges,
    selectionModeIsChecked: selectionMode === SelectionMode.Full,
  };
});

type Props = {
  children: (props: { onOpen: () => void }) => ReactNode;
};

const WorkflowEditorSettings = ({ children }: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const dispatch = useAppDispatch();
  const { shouldAnimateEdges, shouldValidateGraph, shouldSnapToGrid, shouldColorEdges, selectionModeIsChecked } =
    useAppSelector(selector);

  const handleChangeShouldValidate = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      dispatch(shouldValidateGraphChanged(e.target.checked));
    },
    [dispatch]
  );

  const handleChangeShouldAnimate = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      dispatch(shouldAnimateEdgesChanged(e.target.checked));
    },
    [dispatch]
  );

  const handleChangeShouldSnap = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      dispatch(shouldSnapToGridChanged(e.target.checked));
    },
    [dispatch]
  );

  const handleChangeShouldColor = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      dispatch(shouldColorEdgesChanged(e.target.checked));
    },
    [dispatch]
  );

  const handleChangeSelectionMode = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      dispatch(selectionModeChanged(e.target.checked));
    },
    [dispatch]
  );

  const { t } = useTranslation();

  return (
    <>
      {children({ onOpen })}

      <Modal isOpen={isOpen} onClose={onClose} size="2xl" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('nodes.workflowSettings')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex flexDirection="column" gap={4} py={4}>
              <Heading size="sm">{t('parameters.general')}</Heading>
              <FormControl>
                <FormLabel>{t('nodes.animatedEdges')}</FormLabel>
                <Switch onChange={handleChangeShouldAnimate} isChecked={shouldAnimateEdges} />
                <FormHelperText>{t('nodes.animatedEdgesHelp')}</FormHelperText>
              </FormControl>
              <Divider />
              <FormControl>
                <FormLabel>{t('nodes.snapToGrid')}</FormLabel>
                <Switch isChecked={shouldSnapToGrid} onChange={handleChangeShouldSnap} />
                <FormHelperText>{t('nodes.snapToGridHelp')}</FormHelperText>
              </FormControl>
              <Divider />
              <FormControl>
                <FormLabel>{t('nodes.colorCodeEdges')}</FormLabel>
                <Switch isChecked={shouldColorEdges} onChange={handleChangeShouldColor} />
                <FormHelperText>{t('nodes.colorCodeEdgesHelp')}</FormHelperText>
              </FormControl>
              <Divider />
              <FormControl>
                <FormLabel>{t('nodes.fullyContainNodes')}</FormLabel>
                <Switch isChecked={selectionModeIsChecked} onChange={handleChangeSelectionMode} />
                <FormHelperText>{t('nodes.fullyContainNodesHelp')}</FormHelperText>
              </FormControl>
              <Heading size="sm" pt={4}>
                {t('common.advanced')}
              </Heading>
              <FormControl>
                <FormLabel>{t('nodes.validateConnections')}</FormLabel>
                <Switch isChecked={shouldValidateGraph} onChange={handleChangeShouldValidate} />
                <FormHelperText>{t('nodes.validateConnectionsHelp')}</FormHelperText>
              </FormControl>
              <ReloadNodeTemplatesButton />
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default memo(WorkflowEditorSettings);
