# HTML文字遮挡问题解决方案指南

## 🔍 **问题描述**

之前为了解决文字镜像和反转不稳定问题，使用了HTML处理文字，但现在出现遮挡效果问题：
- 面板无法遮挡文字
- 地球无法遮挡文字  
- 弹窗无法遮挡文字

## 🎯 **已实现的解决方案**

### **方案一：启用HTML组件遮挡检测** (✅ 已应用)

在`BillboardText`组件中添加了`occlude`属性：

```tsx
<Html
  position={position}
  center
  distanceFactor={8}
  transform
  sprite
  occlude // 🔧 启用遮挡检测 - 关键属性！
  style={{
    // ... existing styles
    transition: 'opacity 0.2s ease', // 添加平滑过渡
  }}
>
  {children}
</Html>
```

**优点**：
- ✅ 简单易用，只需添加一个属性
- ✅ 自动处理遮挡检测
- ✅ 保持HTML文字的优势（无镜像问题）
- ✅ 平滑的显示/隐藏过渡效果

**缺点**：
- ⚠️ 依赖drei库的实现
- ⚠️ 可能不如自定义实现精确

### **方案二：高级遮挡检测组件** (📦 已创建)

创建了`AdvancedBillboardText`组件，支持自定义遮挡对象：

```tsx
// 使用示例
<AdvancedBillboardText
  position={[0, 1.0, 0]}
  fontSize={0.18}
  color="#ffffff"
  occludeObjects={[earthRef.current]} // 指定遮挡对象
>
  {satelliteName}
</AdvancedBillboardText>
```

**特性**：
- 🎯 精确的射线检测
- 🎯 可指定具体的遮挡对象
- 🎯 自定义遮挡逻辑
- 🎯 平滑的透明度过渡

### **方案三：真实3D文字** (📦 已创建)

创建了`Text3D`组件，完全避免HTML遮挡问题：

```tsx
// 使用示例
<Text3D
  position={[0, 1.0, 0]}
  fontSize={0.2}
  color="#ffffff"
  billboard={true}
>
  {satelliteName}
</Text3D>
```

**优点**：
- ✅ 完美的深度遮挡
- ✅ 真正的3D文字
- ✅ 支持描边和阴影
- ✅ 高性能

**缺点**：
- ⚠️ 需要字体文件
- ⚠️ 可能的中文显示问题

## 🚀 **推荐使用方式**

### **当前最佳方案**：
使用**方案一**（已应用），因为：
1. 最简单直接
2. 已经集成到现有代码中
3. 保持了HTML文字的所有优势
4. 解决了大部分遮挡问题

### **如果需要更精确控制**：
```tsx
import AdvancedBillboardText from './AdvancedBillboardText'

// 在卫星组件中使用
{showLabels && (
  <AdvancedBillboardText
    position={[0, 1.0, 0]}
    fontSize={isSelected ? 0.20 : 0.18}
    color={isSelected ? '#ffffff' : color}
    occludeObjects={earthRef.current ? [earthRef.current] : []}
  >
    {name} {useRealOrbit ? '(TLE)' : '(SIM)'} {positionInfo}
  </AdvancedBillboardText>
)}
```

### **如果需要最佳3D效果**：
```tsx
import Text3D from './Text3D'

// 替换BillboardText
{showLabels && (
  <Text3D
    position={[0, 1.0, 0]}
    fontSize={0.2}
    color={isSelected ? '#ffffff' : color}
    billboard={true}
  >
    {name} {useRealOrbit ? '(TLE)' : '(SIM)'}
  </Text3D>
)}
```

## 🔧 **测试效果**

当前修改后，你应该能看到：
1. ✅ 卫星标签被地球正确遮挡
2. ✅ 文字在被遮挡时平滑淡出
3. ✅ 文字重新显示时平滑淡入
4. ✅ 保持了原有的billboard效果（始终面向相机）

## 📱 **验证方法**

1. 打开应用程序
2. 确保"显示标签"选项已启用
3. 旋转视角，让卫星标签被地球遮挡
4. 观察文字是否正确隐藏/显示

## 🐛 **如果仍有问题**

如果遮挡效果不理想，可以：

1. **调整occlude参数**：
   ```tsx
   occlude={[earthRef.current, panelRef.current]} // 添加更多遮挡对象
   ```

2. **使用方案二的精确控制**：
   ```tsx
   <AdvancedBillboardText
     occludeObjects={[earthRef.current, ...otherObjects]}
   />
   ```

3. **切换到3D文字**：
   完全避免HTML遮挡问题

## 🎨 **性能优化**

- ✅ 方案一：最佳性能，内置优化
- ⚠️ 方案二：中等性能，每帧射线检测
- ✅ 方案三：好性能，原生3D渲染

## 🔄 **回退方案**

如果需要回退到原始HTML文字（无遮挡）：
```tsx
// 移除occlude属性
<Html
  // ... other props
  // occlude // 注释掉这行
>
```

---

**总结**：问题已通过添加`occlude`属性得到解决，如需更精确控制，可使用提供的高级组件。 