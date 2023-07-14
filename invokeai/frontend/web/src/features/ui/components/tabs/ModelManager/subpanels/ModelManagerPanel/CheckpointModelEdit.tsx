import { useAppDispatch, useAppSelector } from 'app/store/storeHooks';

import { Divider, Flex, Text } from '@chakra-ui/react';

// import { addNewModel } from 'app/socketio/actions';
import { useForm } from '@mantine/form';
import { useTranslation } from 'react-i18next';

import type { RootState } from 'app/store/store';
import IAIButton from 'common/components/IAIButton';
import IAIMantineSelect from 'common/components/IAIMantineSelect';

import { makeToast } from 'app/components/Toaster';
import IAIMantineTextInput from 'common/components/IAIMantineInput';
import { MODEL_TYPE_MAP } from 'features/parameters/types/constants';
import { addToast } from 'features/system/store/systemSlice';
import { useUpdateMainModelsMutation } from 'services/api/endpoints/models';
import { components } from 'services/api/schema';
import ModelConvert from './ModelConvert';

const baseModelSelectData = [
  { value: 'sd-1', label: MODEL_TYPE_MAP['sd-1'] },
  { value: 'sd-2', label: MODEL_TYPE_MAP['sd-2'] },
];

const variantSelectData = [
  { value: 'normal', label: 'Normal' },
  { value: 'inpaint', label: 'Inpaint' },
  { value: 'depth', label: 'Depth' },
];

export type CheckpointModelConfig =
  | components['schemas']['StableDiffusion1ModelCheckpointConfig']
  | components['schemas']['StableDiffusion2ModelCheckpointConfig'];

type CheckpointModelEditProps = {
  modelToEdit: string;
  retrievedModel: CheckpointModelConfig;
};

export default function CheckpointModelEdit(props: CheckpointModelEditProps) {
  const isProcessing = useAppSelector(
    (state: RootState) => state.system.isProcessing
  );

  const { modelToEdit, retrievedModel } = props;

  const [updateMainModel, { error, isLoading }] = useUpdateMainModelsMutation();

  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const checkpointEditForm = useForm<CheckpointModelConfig>({
    initialValues: {
      model_name: retrievedModel.model_name ? retrievedModel.model_name : '',
      base_model: retrievedModel.base_model,
      model_type: 'main',
      path: retrievedModel.path ? retrievedModel.path : '',
      description: retrievedModel.description ? retrievedModel.description : '',
      model_format: 'checkpoint',
      vae: retrievedModel.vae ? retrievedModel.vae : '',
      config: retrievedModel.config ? retrievedModel.config : '',
      variant: retrievedModel.variant,
    },
    validate: {
      path: (value) =>
        value.trim().length === 0 ? 'Must provide a path' : null,
    },
  });

  const editModelFormSubmitHandler = (values: CheckpointModelConfig) => {
    const responseBody = {
      base_model: retrievedModel.base_model,
      model_name: retrievedModel.model_name,
      body: values,
    };
    updateMainModel(responseBody)
      .unwrap()
      .then((payload) => {
        checkpointEditForm.setValues(payload as CheckpointModelConfig);
        dispatch(
          addToast(
            makeToast({
              title: t('modelManager.modelUpdated'),
              status: 'success',
            })
          )
        );
      })
      .catch((error) => {
        checkpointEditForm.reset();
        dispatch(
          addToast(
            makeToast({
              title: t('modelManager.modelUpdateFailed'),
              status: 'error',
            })
          )
        );
      });
  };

  return modelToEdit ? (
    <Flex flexDirection="column" rowGap={4} width="100%">
      <Flex justifyContent="space-between" alignItems="center">
        <Flex flexDirection="column">
          <Text fontSize="lg" fontWeight="bold">
            {retrievedModel.model_name}
          </Text>
          <Text fontSize="sm" color="base.400">
            {MODEL_TYPE_MAP[retrievedModel.base_model]} Model
          </Text>
        </Flex>
        <ModelConvert model={retrievedModel} />
      </Flex>
      <Divider />

      <Flex
        flexDirection="column"
        maxHeight={window.innerHeight - 270}
        overflowY="scroll"
      >
        <form
          onSubmit={checkpointEditForm.onSubmit((values) =>
            editModelFormSubmitHandler(values)
          )}
        >
          <Flex flexDirection="column" overflowY="scroll" gap={4}>
            <IAIMantineTextInput
              label={t('modelManager.description')}
              {...checkpointEditForm.getInputProps('description')}
            />
            <IAIMantineSelect
              label={t('modelManager.baseModel')}
              data={baseModelSelectData}
              {...checkpointEditForm.getInputProps('base_model')}
            />
            <IAIMantineSelect
              label={t('modelManager.variant')}
              data={variantSelectData}
              {...checkpointEditForm.getInputProps('variant')}
            />
            <IAIMantineTextInput
              label={t('modelManager.modelLocation')}
              {...checkpointEditForm.getInputProps('path')}
            />
            <IAIMantineTextInput
              label={t('modelManager.vaeLocation')}
              {...checkpointEditForm.getInputProps('vae')}
            />
            <IAIMantineTextInput
              label={t('modelManager.config')}
              {...checkpointEditForm.getInputProps('config')}
            />
            <IAIButton
              disabled={isProcessing}
              type="submit"
              isLoading={isLoading}
            >
              {t('modelManager.updateModel')}
            </IAIButton>
          </Flex>
        </form>
      </Flex>
    </Flex>
  ) : (
    <Flex
      sx={{
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 'base',
        bg: 'base.900',
      }}
    >
      <Text fontWeight={500}>Pick A Model To Edit</Text>
    </Flex>
  );
}
