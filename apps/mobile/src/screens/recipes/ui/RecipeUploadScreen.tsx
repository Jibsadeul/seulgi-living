import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller, useFieldArray, type Control, type UseFormWatch } from 'react-hook-form';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header, showAppToast } from '@/shared/ui';
import { pickImageUri } from '@/shared/lib/image';
import {
  getCookingMethodLabel,
  getCategoryLabel,
  useRecipeDetail,
  useCreateRecipe,
  type CookingMethod,
  type RecipeCategory,
  type RecipeDetail,
} from '@/entities/recipes';

const COOKING_METHODS: CookingMethod[] = [
  'BOIL',
  'GRILL',
  'STIR_FRY',
  'STEAM',
  'FRY',
  'BRAISE',
  'PAN_FRY',
  'OTHER',
];

const CATEGORIES: RecipeCategory[] = [
  'SOUP_STEW',
  'SIDE_DISH',
  'RICE_PORRIDGE',
  'DESSERT',
  'OTHER',
];

type IngredientField = {
  name: string;
  amount: string;
};

type StepField = {
  description: string;
  imageUri: string;
};

type FormValues = {
  name: string;
  cookingMethod: CookingMethod | '';
  category: RecipeCategory | '';
  mainImageUri: string;
  ingredients: IngredientField[];
  steps: StepField[];
  sodiumTip: string;
};

function SectionHeader({
  icon,
  title,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
}) {
  return (
    <View className="mb-3 flex-row items-center gap-2">
      <View className="h-6 w-6 items-center justify-center rounded-full bg-main-100">
        <Ionicons name={icon} size={14} color="#FFFFFF" />
      </View>
      <Text className="text-sm font-bold text-gray-90">{title}</Text>
    </View>
  );
}

function DropdownList<T extends string>({
  items,
  selected,
  onSelect,
  labelFn,
}: {
  items: T[];
  selected: T | '';
  onSelect: (value: T) => void;
  labelFn: (value: T) => string;
}) {
  return (
    <View className="mt-2 rounded-lg border border-gray-20 bg-surface-default">
      {items.map((item, index) => {
        const active = selected === item;
        return (
          <Pressable
            key={item}
            className={`px-4 py-3 ${index < items.length - 1 ? 'border-b border-gray-10' : ''} ${active ? 'bg-main-10' : ''}`}
            onPress={() => onSelect(item)}
          >
            <Text
              className={`text-sm ${active ? 'font-semibold text-main-100' : 'text-gray-80'}`}
            >
              {labelFn(item)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function recipeDetailToDefaults(recipe: RecipeDetail): FormValues {
  const ingredientItems = recipe.ingredients.flatMap((section) =>
    section.items.map((item) => {
      const parts = item.match(/^(.+?)\s+([\d\w.\/]+.*)$/);
      return parts ? { name: parts[1], amount: parts[2] } : { name: item, amount: '' };
    }),
  );

  return {
    name: recipe.name,
    cookingMethod: recipe.cookingMethod,
    category: recipe.category,
    mainImageUri: recipe.mainImageUrl,
    ingredients: ingredientItems.length > 0
      ? ingredientItems
      : [{ name: '', amount: '' }, { name: '', amount: '' }],
    steps: recipe.steps.length > 0
      ? recipe.steps.map((s) => ({ description: s.description, imageUri: s.imageUrl ?? '' }))
      : [{ description: '', imageUri: '' }, { description: '', imageUri: '' }],
    sodiumTip: recipe.sodiumTip ?? '',
  };
}

const EMPTY_DEFAULTS: FormValues = {
  name: '',
  cookingMethod: '',
  category: '',
  mainImageUri: '',
  ingredients: [
    { name: '', amount: '' },
    { name: '', amount: '' },
  ],
  steps: [
    { description: '', imageUri: '' },
    { description: '', imageUri: '' },
  ],
  sodiumTip: '',
};

export function RecipeUploadScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { editId } = useLocalSearchParams<{ editId?: string }>();
  const { data: editData, isLoading: isEditLoading } = useRecipeDetail(editId ?? '', !!editId);
  const createRecipe = useCreateRecipe();
  const isEditMode = !!editId && !!editData;

  const { control, handleSubmit, setValue, watch } = useForm<FormValues>({
    defaultValues: EMPTY_DEFAULTS,
    values: editData ? recipeDetailToDefaults(editData.recipe) : undefined,
  });

  const { fields: stepFields, append: appendStep, remove: removeStep } = useFieldArray({ control, name: 'steps' });
  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient,
  } = useFieldArray({ control, name: 'ingredients' });

  const mainImageUri = watch('mainImageUri');

  async function handlePickMainImage() {
    const uri = await pickImageUri('library');
    if (!uri) return;
    setValue('mainImageUri', uri);
  }

  async function handlePickImage(stepIndex: number) {
    const uri = await pickImageUri('library');
    if (!uri) return;
    setValue(`steps.${stepIndex}.imageUri`, uri);
  }

  function onSubmit(data: FormValues) {
    if (!data.cookingMethod) {
      showAppToast({ type: 'warning', text: '조리 방법을 선택해주세요.' });
      return;
    }
    if (!data.category) {
      showAppToast({ type: 'warning', text: '요리 종류를 선택해주세요.' });
      return;
    }
    if (!data.name.trim()) {
      showAppToast({ type: 'warning', text: '메뉴 명칭을 입력해주세요.' });
      return;
    }
    const validIngredients = data.ingredients.filter((i) => i.name.trim());
    if (validIngredients.length === 0) {
      showAppToast({ type: 'warning', text: '재료 정보를 입력해주세요.' });
      return;
    }
    const validSteps = data.steps.filter((s) => s.description.trim());
    if (validSteps.length === 0) {
      showAppToast({ type: 'warning', text: '조리 단계를 하나 이상 입력해주세요.' });
      return;
    }

    const ingredientsString = validIngredients
      .map((i) => (i.amount.trim() ? `${i.name.trim()} ${i.amount.trim()}` : i.name.trim()))
      .join(', ');

    const trimmedSteps = validSteps.map((s) => ({
      description: s.description.trim(),
      imageUri: s.imageUri,
    }));

    createRecipe.mutate({
      name: data.name.trim(),
      cookingMethod: data.cookingMethod as CookingMethod,
      category: data.category as RecipeCategory,
      ingredients: ingredientsString,
      steps: trimmedSteps,
      sodiumTip: data.sodiumTip.trim(),
      mainImageUri: data.mainImageUri,
    });

    router.back();
  }

  return (
    <View className="flex-1 bg-surface-card">
      <Header title={isEditMode ? '레시피 수정' : '레시피 등록'} variant="back" />

      {isEditLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#EF7722" size="large" />
        </View>
      ) : (
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── 기본 정보 ── */}
        <View className="mx-4 mt-4 rounded-2xl bg-surface-default p-4">
          <SectionHeader icon="document-text-outline" title="기본 정보" />

          <Text className="mb-1.5 text-xs font-medium text-gray-70">대표 이미지</Text>
          <Pressable
            className="mb-4 h-40 items-center justify-center overflow-hidden rounded-lg border border-dashed border-gray-30 bg-surface-card"
            onPress={handlePickMainImage}
          >
            {mainImageUri ? (
              <Image
                source={{ uri: mainImageUri }}
                className="h-full w-full"
                resizeMode="cover"
              />
            ) : (
              <View className="items-center">
                <Ionicons name="camera-outline" size={28} color="#C6C6C6" />
                <Text className="mt-1 text-xs text-gray-40">사진 업로드</Text>
              </View>
            )}
          </Pressable>

          <Text className="mb-1.5 text-xs font-medium text-gray-70">메뉴 명칭</Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="h-12 rounded-lg border border-gray-20 px-3 text-xs text-gray-90"
                placeholder="예: 매콤 달콤 닭볶음탕"
                placeholderTextColor="#8E8E8E"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />

          <DropdownSelectors control={control} watch={watch} />
        </View>

        {/* ── 재료 및 미디어 ── */}
        <View className="mx-4 mt-3 rounded-2xl bg-surface-default p-4">
          <SectionHeader icon="restaurant-outline" title="재료 및 미디어" />

          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-sm font-bold text-gray-90">상세 재료 정보</Text>
            <Text className="text-xs text-gray-50">재료명 / 분량</Text>
          </View>

          {ingredientFields.map((field, index) => (
            <View key={field.id} className="mb-2 flex-row items-center gap-2">
              <View className="flex-1">
                <Controller
                  control={control}
                  name={`ingredients.${index}.name`}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className="h-10 rounded-lg border border-gray-20 px-2.5 text-[11px] text-gray-90"
                      placeholder="예: 연두부"
                      placeholderTextColor="#8E8E8E"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  )}
                />
              </View>
              <View className="w-24">
                <Controller
                  control={control}
                  name={`ingredients.${index}.amount`}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className="h-10 rounded-lg border border-gray-20 px-2.5 text-[11px] text-gray-90"
                      placeholder="예: 75g"
                      placeholderTextColor="#8E8E8E"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  )}
                />
              </View>
              {ingredientFields.length > 1 && (
                <Pressable hitSlop={8} onPress={() => removeIngredient(index)}>
                  <Ionicons name="close" size={18} color="#8E8E8E" />
                </Pressable>
              )}
            </View>
          ))}

          <Pressable
            className="mt-2 h-10 flex-row items-center justify-center rounded-lg border border-gray-20"
            onPress={() => appendIngredient({ name: '', amount: '' })}
          >
            <Ionicons name="add-circle-outline" size={18} color="#8E8E8E" />
            <Text className="ml-1 text-sm font-medium text-gray-50">재료 추가</Text>
          </Pressable>
        </View>

        {/* ── 조리 순서 ── */}
        <View className="mx-4 mt-3 rounded-2xl bg-surface-default p-4">
          <SectionHeader icon="list-outline" title="조리 순서" />

          {stepFields.map((field, index) => (
            <View key={field.id} className={index > 0 ? 'mt-4' : ''}>
              <View className="mb-2 flex-row items-center">
                <View className="h-6 w-6 items-center justify-center rounded-full bg-main-100">
                  <Text className="text-[10px] font-bold text-white">
                    {String(index + 1).padStart(2, '0')}
                  </Text>
                </View>
                {stepFields.length > 1 && (
                  <Pressable onPress={() => removeStep(index)} className="ml-auto p-1">
                    <Ionicons name="close-circle-outline" size={18} color="#8E8E8E" />
                  </Pressable>
                )}
              </View>

              <Controller
                control={control}
                name={`steps.${index}.description`}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="min-h-[72px] rounded-lg border border-gray-20 px-3 py-2.5 text-xs text-gray-90"
                    placeholder={`${index === 0 ? '첫' : index === 1 ? '두' : `${index + 1}`} 번째 조리 단계를 상세히\n적어주세요.`}
                    placeholderTextColor="#8E8E8E"
                    multiline
                    textAlignVertical="top"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                )}
              />

              <StepImageUpload
                imageUri={watch(`steps.${index}.imageUri`)}
                onPress={() => handlePickImage(index)}
              />
            </View>
          ))}

          <Pressable
            className="mt-4 h-10 flex-row items-center justify-center rounded-lg border border-main-100"
            onPress={() => appendStep({ description: '', imageUri: '' })}
          >
            <Ionicons name="add" size={16} color="#EF7722" />
            <Text className="ml-1 text-sm font-medium text-main-100">단계 추가</Text>
          </Pressable>
        </View>

        {/* ── 저나트륨 비법 노하우 ── */}
        <View className="mx-4 mt-3 rounded-2xl bg-surface-default p-4">
          <SectionHeader icon="bulb-outline" title="저나트륨 비법 노하우" />

          <View className="mb-3 rounded-lg bg-main-10 p-3">
            <Text className="text-xs leading-5 text-main-100">
              간단 슬기팁에서 나트륨을 줄일 수 있는 나만의{'\n'}
              방법을 공유해 보세요!{'\n'}
              (예: 양념 곁에서 활용하기)
            </Text>
          </View>

          <Controller
            control={control}
            name="sodiumTip"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="min-h-[60px] rounded-lg border border-gray-20 px-3 py-2.5 text-xs text-gray-90"
                placeholder="나트륨 감정 요리 팁"
                placeholderTextColor="#8E8E8E"
                multiline
                textAlignVertical="top"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
        </View>

        {/* ── 저장 버튼 ── */}
        <View className="mx-4 mt-4">
          <Pressable
            className="h-12 items-center justify-center rounded-xl bg-main-100"
            onPress={handleSubmit(onSubmit)}
          >
            <Text className="text-base font-bold text-white">
              {isEditMode ? '수정하기' : '저장하기'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
      )}
    </View>
  );
}

function StepImageUpload({
  imageUri,
  onPress,
}: {
  imageUri: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      className="mt-2 h-24 items-center justify-center overflow-hidden rounded-lg border border-dashed border-gray-30 bg-surface-card"
      onPress={onPress}
    >
      {imageUri ? (
        <Image source={{ uri: imageUri }} className="h-full w-full" resizeMode="cover" />
      ) : (
        <View className="items-center">
          <Ionicons name="image-outline" size={24} color="#C6C6C6" />
          <Text className="mt-1 text-xs text-gray-40">과정 사진 첨부</Text>
        </View>
      )}
    </Pressable>
  );
}

type OpenDropdown = 'method' | 'category' | null;

function DropdownSelectors({
  control,
  watch,
}: {
  control: Control<FormValues>;
  watch: UseFormWatch<FormValues>;
}) {
  const [open, setOpen] = useState<OpenDropdown>(null);
  const cookingMethod = watch('cookingMethod');
  const category = watch('category');

  return (
    <View className="mt-4">
      <View className="flex-row gap-3">
        <View className="flex-1">
          <Text className="mb-1.5 text-sm font-bold text-gray-90">조리 방법</Text>
          <Pressable
            className={`flex-row items-center justify-between rounded-lg border px-3 py-2.5 ${open === 'method' ? 'border-main-100' : 'border-gray-20'}`}
            onPress={() => setOpen((prev) => (prev === 'method' ? null : 'method'))}
          >
            <Text className={cookingMethod ? 'text-sm text-gray-90' : 'text-sm text-gray-50'}>
              {cookingMethod ? getCookingMethodLabel(cookingMethod) : '선택'}
            </Text>
            <Ionicons
              name={open === 'method' ? 'chevron-up' : 'chevron-down'}
              size={16}
              color="#8E8E8E"
            />
          </Pressable>
        </View>

        <View className="flex-1">
          <Text className="mb-1.5 text-sm font-bold text-gray-90">요리 종류</Text>
          <Pressable
            className={`flex-row items-center justify-between rounded-lg border px-3 py-2.5 ${open === 'category' ? 'border-main-100' : 'border-gray-20'}`}
            onPress={() => setOpen((prev) => (prev === 'category' ? null : 'category'))}
          >
            <Text className={category ? 'text-sm text-gray-90' : 'text-sm text-gray-50'}>
              {category ? getCategoryLabel(category) : '선택'}
            </Text>
            <Ionicons
              name={open === 'category' ? 'chevron-up' : 'chevron-down'}
              size={16}
              color="#8E8E8E"
            />
          </Pressable>
        </View>
      </View>

      {open === 'method' && (
        <Controller
          control={control}
          name="cookingMethod"
          render={({ field: { value, onChange } }) => (
            <DropdownList
              items={COOKING_METHODS}
              selected={value}
              onSelect={(v) => {
                onChange(v);
                setOpen(null);
              }}
              labelFn={getCookingMethodLabel}
            />
          )}
        />
      )}

      {open === 'category' && (
        <Controller
          control={control}
          name="category"
          render={({ field: { value, onChange } }) => (
            <DropdownList
              items={CATEGORIES}
              selected={value}
              onSelect={(v) => {
                onChange(v);
                setOpen(null);
              }}
              labelFn={getCategoryLabel}
            />
          )}
        />
      )}
    </View>
  );
}
